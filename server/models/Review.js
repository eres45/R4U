const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie ID is required'],
    index: true
  },
  tmdbMovieId: {
    type: Number,
    required: [true, 'TMDB Movie ID is required'],
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1 star'],
    max: [5, 'Rating cannot exceed 5 stars'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v) || (v * 2) % 1 === 0; // Allow half stars
      },
      message: 'Rating must be a whole number or half number (e.g., 3.5)'
    }
  },
  reviewText: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
    minlength: [10, 'Review must be at least 10 characters long'],
    maxlength: [2000, 'Review cannot exceed 2000 characters']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  // Helpful votes from other users
  helpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  // Users who voted this review as helpful
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Moderation status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved'
  },
  // Flag for inappropriate content
  flaggedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'offensive', 'spoiler', 'other']
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Spoiler warning
  containsSpoilers: {
    type: Boolean,
    default: false
  },
  // Review metadata
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  lastEditedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one review per user per movie
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });
reviewSchema.index({ userId: 1, tmdbMovieId: 1 }, { unique: true });

// Index for sorting and filtering
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ helpfulVotes: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });

// Virtual for user details
reviewSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for movie details
reviewSchema.virtual('movie', {
  ref: 'Movie',
  localField: 'movieId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to update lastEditedAt
reviewSchema.pre('save', function(next) {
  if (this.isModified('reviewText') || this.isModified('rating') || this.isModified('title')) {
    this.lastEditedAt = new Date();
  }
  next();
});

// Post-save middleware to update movie's average rating
reviewSchema.post('save', async function() {
  const Movie = mongoose.model('Movie');
  const movie = await Movie.findById(this.movieId);
  if (movie) {
    await movie.updateAverageRating();
  }
});

// Post-remove middleware to update movie's average rating
reviewSchema.post('remove', async function() {
  const Movie = mongoose.model('Movie');
  const movie = await Movie.findById(this.movieId);
  if (movie) {
    await movie.updateAverageRating();
  }
});

// Instance method to check if user has voted this review as helpful
reviewSchema.methods.isHelpfulBy = function(userId) {
  return this.helpfulBy.includes(userId);
};

// Instance method to toggle helpful vote
reviewSchema.methods.toggleHelpfulVote = async function(userId) {
  const userObjectId = mongoose.Types.ObjectId(userId);
  const index = this.helpfulBy.indexOf(userObjectId);
  
  if (index > -1) {
    // Remove vote
    this.helpfulBy.splice(index, 1);
    this.helpfulVotes = Math.max(0, this.helpfulVotes - 1);
  } else {
    // Add vote
    this.helpfulBy.push(userObjectId);
    this.helpfulVotes += 1;
  }
  
  await this.save();
  return index === -1; // Return true if vote was added, false if removed
};

// Static method to get reviews for a movie
reviewSchema.statics.getMovieReviews = function(movieId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = -1,
    minRating,
    maxRating
  } = options;

  const query = { movieId, status: 'approved' };
  
  if (minRating) query.rating = { ...query.rating, $gte: minRating };
  if (maxRating) query.rating = { ...query.rating, $lte: maxRating };

  return this.find(query)
    .populate('userId', 'username profilePicture joinDate')
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to get user's reviews
reviewSchema.statics.getUserReviews = function(userId, options = {}) {
  const { page = 1, limit = 10 } = options;
  
  return this.find({ userId, status: 'approved' })
    .populate('movieId', 'title posterPath releaseDate')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to get recent reviews
reviewSchema.statics.getRecentReviews = function(limit = 10) {
  return this.find({ status: 'approved' })
    .populate('userId', 'username profilePicture')
    .populate('movieId', 'title posterPath')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Review', reviewSchema);
