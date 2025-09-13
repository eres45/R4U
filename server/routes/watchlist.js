const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Watchlist = require('../models/Watchlist');
const Movie = require('../models/Movie');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/watchlist
// @desc    Get user's watchlist
// @access  Private
router.get('/', authenticateToken, [
  query('status').optional().isIn(['want_to_watch', 'watching', 'watched', 'dropped']).withMessage('Invalid status'),
  query('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sort').optional().isIn(['dateAdded', 'priority', 'title']).withMessage('Invalid sort field')
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

    const userId = req.user._id;
    const {
      status,
      priority,
      page = 1,
      limit = 20,
      sort = 'dateAdded',
      order = 'desc'
    } = req.query;

    const options = {
      status,
      priority,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy: sort,
      sortOrder: order === 'desc' ? -1 : 1
    };

    const watchlistItems = await Watchlist.getUserWatchlist(userId, options);
    const total = await Watchlist.countDocuments({ 
      userId,
      ...(status && { status }),
      ...(priority && { priority })
    });

    res.json({
      success: true,
      data: {
        watchlist: watchlistItems,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/watchlist/stats
// @desc    Get user's watchlist statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const stats = await Watchlist.getUserWatchlistStats(userId);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get watchlist stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/watchlist
// @desc    Add movie to watchlist
// @access  Private
router.post('/', authenticateToken, [
  body('movieId').isMongoId().withMessage('Valid movie ID is required'),
  body('tmdbMovieId').isInt().withMessage('TMDB movie ID is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('status').optional().isIn(['want_to_watch', 'watching', 'watched', 'dropped']).withMessage('Invalid status')
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

    const userId = req.user._id;
    const { movieId, tmdbMovieId, priority, notes, status } = req.body;

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Check if movie is already in watchlist
    const existingItem = await Watchlist.findOne({ userId, movieId });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Movie is already in your watchlist'
      });
    }

    // Create watchlist item
    const watchlistItem = new Watchlist({
      userId,
      movieId,
      tmdbMovieId,
      priority: priority || 'medium',
      notes,
      status: status || 'want_to_watch'
    });

    await watchlistItem.save();
    await watchlistItem.populate('movieId', 'title posterPath releaseDate genres averageRating');

    res.status(201).json({
      success: true,
      message: 'Movie added to watchlist',
      data: { watchlistItem }
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/watchlist/:id
// @desc    Update watchlist item
// @access  Private
router.put('/:id', authenticateToken, [
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('status').optional().isIn(['want_to_watch', 'watching', 'watched', 'dropped']).withMessage('Invalid status'),
  body('userRating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
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

    const userId = req.user._id;
    const itemId = req.params.id;

    const watchlistItem = await Watchlist.findOne({ _id: itemId, userId });
    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    // Update fields
    const { priority, notes, status, userRating } = req.body;
    if (priority !== undefined) watchlistItem.priority = priority;
    if (notes !== undefined) watchlistItem.notes = notes;
    if (status !== undefined) watchlistItem.status = status;
    if (userRating !== undefined) watchlistItem.userRating = userRating;

    await watchlistItem.save();
    await watchlistItem.populate('movieId', 'title posterPath releaseDate genres averageRating');

    res.json({
      success: true,
      message: 'Watchlist item updated',
      data: { watchlistItem }
    });
  } catch (error) {
    console.error('Update watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/watchlist/:id
// @desc    Remove movie from watchlist
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const itemId = req.params.id;

    const watchlistItem = await Watchlist.findOne({ _id: itemId, userId });
    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    await watchlistItem.remove();

    res.json({
      success: true,
      message: 'Movie removed from watchlist'
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/watchlist/:id/watched
// @desc    Mark movie as watched
// @access  Private
router.post('/:id/watched', authenticateToken, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
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

    const userId = req.user._id;
    const itemId = req.params.id;
    const { rating } = req.body;

    const watchlistItem = await Watchlist.findOne({ _id: itemId, userId });
    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    await watchlistItem.markAsWatched(rating);
    await watchlistItem.populate('movieId', 'title posterPath releaseDate genres averageRating');

    res.json({
      success: true,
      message: 'Movie marked as watched',
      data: { watchlistItem }
    });
  } catch (error) {
    console.error('Mark as watched error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/watchlist/check/:tmdbId
// @desc    Check if movie is in user's watchlist
// @access  Private
router.get('/check/:tmdbId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const tmdbMovieId = req.params.tmdbId;

    const watchlistItem = await Watchlist.findOne({ userId, tmdbMovieId });

    res.json({
      success: true,
      data: {
        inWatchlist: !!watchlistItem,
        item: watchlistItem || null
      }
    });
  } catch (error) {
    console.error('Check watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
