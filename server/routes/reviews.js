const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get reviews with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('movieId').optional().isMongoId().withMessage('Invalid movie ID'),
  query('userId').optional().isMongoId().withMessage('Invalid user ID'),
  query('minRating').optional().isInt({ min: 1, max: 5 }).withMessage('Min rating must be between 1 and 5'),
  query('maxRating').optional().isInt({ min: 1, max: 5 }).withMessage('Max rating must be between 1 and 5'),
  query('sort').optional().isIn(['createdAt', 'rating', 'helpfulVotes']).withMessage('Invalid sort field')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      movieId,
      userId,
      minRating,
      maxRating,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = { status: 'approved' };
    
    if (movieId) query.movieId = movieId;
    if (userId) query.userId = userId;
    if (minRating) query.rating = { ...query.rating, $gte: parseInt(minRating) };
    if (maxRating) query.rating = { ...query.rating, $lte: parseInt(maxRating) };

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };

    const reviews = await Review.find(query)
      .populate('userId', 'username profilePicture joinDate')
      .populate('movieId', 'title posterPath releaseDate')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reviews/movie/:movieId
// @desc    Get reviews for a specific movie
// @access  Public
router.get('/movie/:movieId', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('sort').optional().isIn(['createdAt', 'rating', 'helpfulVotes'])
], async (req, res) => {
  try {
    const { movieId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      minRating,
      maxRating
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy: sort,
      sortOrder: order === 'desc' ? -1 : 1,
      minRating: minRating ? parseInt(minRating) : undefined,
      maxRating: maxRating ? parseInt(maxRating) : undefined
    };

    const reviews = await Review.getMovieReviews(movieId, options);
    const total = await Review.countDocuments({ 
      movieId, 
      status: 'approved',
      ...(minRating && { rating: { $gte: minRating } }),
      ...(maxRating && { rating: { $lte: maxRating } })
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get movie reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get reviews by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const reviews = await Review.getUserReviews(userId, options);
    const total = await Review.countDocuments({ userId, status: 'approved' });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reviews/recent
// @desc    Get recent reviews
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const reviews = await Review.getRecentReviews(parseInt(limit));

    res.json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    console.error('Get recent reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', authenticateToken, [
  body('movieId').isMongoId().withMessage('Valid movie ID is required'),
  body('tmdbMovieId').isInt().withMessage('TMDB movie ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewText').isLength({ min: 10, max: 2000 }).withMessage('Review text must be between 10 and 2000 characters'),
  body('title').optional().isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('containsSpoilers').optional().isBoolean().withMessage('Contains spoilers must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { movieId, tmdbMovieId, rating, reviewText, title, containsSpoilers } = req.body;
    const userId = req.user._id;

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({ userId, movieId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this movie'
      });
    }

    // Create review
    const review = new Review({
      userId,
      movieId,
      tmdbMovieId,
      rating,
      reviewText,
      title,
      containsSpoilers: containsSpoilers || false
    });

    await review.save();

    // Populate user and movie data
    await review.populate('userId', 'username profilePicture joinDate');
    await review.populate('movieId', 'title posterPath');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', authenticateToken, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewText').optional().isLength({ min: 10, max: 2000 }).withMessage('Review text must be between 10 and 2000 characters'),
  body('title').optional().isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('containsSpoilers').optional().isBoolean().withMessage('Contains spoilers must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const reviewId = req.params.id;
    const userId = req.user._id;

    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized'
      });
    }

    // Update review
    const { rating, reviewText, title, containsSpoilers } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (reviewText !== undefined) review.reviewText = reviewText;
    if (title !== undefined) review.title = title;
    if (containsSpoilers !== undefined) review.containsSpoilers = containsSpoilers;

    await review.save();

    await review.populate('userId', 'username profilePicture joinDate');
    await review.populate('movieId', 'title posterPath');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user._id;

    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized'
      });
    }

    await review.remove();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Toggle helpful vote for a review
// @access  Private
router.post('/:id/helpful', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Users cannot vote on their own reviews
    if (review.userId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote on your own review'
      });
    }

    const wasAdded = await review.toggleHelpfulVote(userId);

    res.json({
      success: true,
      message: wasAdded ? 'Helpful vote added' : 'Helpful vote removed',
      data: {
        helpfulVotes: review.helpfulVotes,
        userVoted: wasAdded
      }
    });
  } catch (error) {
    console.error('Toggle helpful vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
