const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Movie = require('../models/Movie');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/movies
// @desc    Get movies with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('genre').optional().isString().withMessage('Genre must be a string'),
  query('year').optional().isInt({ min: 1900, max: 2030 }).withMessage('Year must be between 1900 and 2030'),
  query('sort').optional().isIn(['title', 'releaseDate', 'averageRating', 'popularity']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
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
      limit = 20,
      genre,
      year,
      sort = 'popularity',
      order = 'desc',
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (genre) {
      query['genres.name'] = new RegExp(genre, 'i');
    }
    
    if (year) {
      query.releaseDate = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`)
      };
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };

    const movies = await Movie.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-videos -cast');

    const total = await Movie.countDocuments(query);

    res.json({
      success: true,
      data: {
        movies,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/movies/trending
// @desc    Get trending movies
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const movies = await Movie.getTrending(parseInt(limit));

    res.json({
      success: true,
      data: { movies }
    });
  } catch (error) {
    console.error('Get trending movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/movies/top-rated
// @desc    Get top rated movies
// @access  Public
router.get('/top-rated', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const movies = await Movie.getTopRated(parseInt(limit));

    res.json({
      success: true,
      data: { movies }
    });
  } catch (error) {
    console.error('Get top rated movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/movies/:id
// @desc    Get movie by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.json({
      success: true,
      data: { movie }
    });
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/movies/tmdb/:tmdbId
// @desc    Get movie by TMDB ID
// @access  Public
router.get('/tmdb/:tmdbId', optionalAuth, async (req, res) => {
  try {
    const movie = await Movie.findOne({ tmdbId: req.params.tmdbId });
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.json({
      success: true,
      data: { movie }
    });
  } catch (error) {
    console.error('Get movie by TMDB ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/movies
// @desc    Create/sync movie from TMDB
// @access  Public (for TMDB sync)
router.post('/', [
  body('tmdbId').isInt().withMessage('TMDB ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('overview').optional().isString(),
  body('releaseDate').optional().isISO8601().withMessage('Invalid release date'),
  body('runtime').optional().isInt({ min: 1 }).withMessage('Runtime must be positive'),
  body('genres').optional().isArray().withMessage('Genres must be an array'),
  body('cast').optional().isArray().withMessage('Cast must be an array'),
  body('posterPath').optional().isString(),
  body('backdropPath').optional().isString()
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

    const { tmdbId } = req.body;

    // Check if movie already exists
    let movie = await Movie.findOne({ tmdbId });
    
    if (movie) {
      // Update existing movie
      Object.assign(movie, req.body);
      movie.lastSyncDate = new Date();
      await movie.save();
    } else {
      // Create new movie
      movie = new Movie({
        ...req.body,
        lastSyncDate: new Date()
      });
      await movie.save();
    }

    res.status(movie.isNew ? 201 : 200).json({
      success: true,
      message: movie.isNew ? 'Movie created successfully' : 'Movie updated successfully',
      data: { movie }
    });
  } catch (error) {
    console.error('Create/update movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
