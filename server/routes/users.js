const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const Review = require('../models/Review');
const Watchlist = require('../models/Watchlist');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's public profile
    const profile = user.getPublicProfile();

    // Get user's review count
    const reviewCount = await Review.countDocuments({ userId, status: 'approved' });
    
    // Get user's watchlist count (only if public or own profile)
    let watchlistCount = 0;
    if (req.user && req.user._id.toString() === userId) {
      // Own profile - show all watchlist items
      watchlistCount = await Watchlist.countDocuments({ userId });
    } else {
      // Other user's profile - only show public watchlist items
      watchlistCount = await Watchlist.countDocuments({ userId, isPublic: true });
    }

    res.json({
      success: true,
      data: {
        user: {
          ...profile,
          reviewCount,
          watchlistCount
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id/reviews
// @desc    Get user's reviews
// @access  Public
router.get('/:id/reviews', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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

    const userId = req.params.id;
    const { page = 1, limit = 10 } = req.query;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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

// @route   GET /api/users/:id/watchlist
// @desc    Get user's public watchlist
// @access  Public
router.get('/:id/watchlist', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['want_to_watch', 'watching', 'watched', 'dropped']).withMessage('Invalid status')
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

    const userId = req.params.id;
    const { page = 1, limit = 20, status } = req.query;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build query - only show public items unless it's the user's own profile
    const query = { userId };
    if (status) query.status = status;
    
    // Only show public watchlist items unless viewing own profile
    if (!req.user || req.user._id.toString() !== userId) {
      query.isPublic = true;
    }

    const watchlistItems = await Watchlist.find(query)
      .populate('movieId', 'title posterPath releaseDate genres averageRating')
      .sort({ dateAdded: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Watchlist.countDocuments(query);

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
    console.error('Get user watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users
// @desc    Search users
// @access  Public
router.get('/', [
  query('search').optional().isString().withMessage('Search must be a string'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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

    const { search, page = 1, limit = 20 } = req.query;

    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('username profilePicture joinDate')
      .sort({ joinDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/stats/top-reviewers
// @desc    Get top reviewers
// @access  Public
router.get('/stats/top-reviewers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topReviewers = await Review.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$userId',
          reviewCount: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { reviewCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          user: {
            _id: '$user._id',
            username: '$user.username',
            profilePicture: '$user.profilePicture',
            joinDate: '$user.joinDate'
          },
          reviewCount: 1,
          averageRating: { $round: ['$averageRating', 1] }
        }
      }
    ]);

    res.json({
      success: true,
      data: { topReviewers }
    });
  } catch (error) {
    console.error('Get top reviewers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
