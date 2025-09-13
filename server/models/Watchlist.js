const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
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
  dateAdded: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Priority level for the user's watchlist
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  // User's notes about why they want to watch this movie
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  // Status of the movie in user's watchlist
  status: {
    type: String,
    enum: ['want_to_watch', 'watching', 'watched', 'dropped'],
    default: 'want_to_watch'
  },
  // Date when user marked as watched
  watchedDate: Date,
  // User's rating after watching (if watched)
  userRating: {
    type: Number,
    min: 1,
    max: 5,
    validate: {
      validator: function(v) {
        return this.status === 'watched' ? v != null : true;
      },
      message: 'Rating is required when status is watched'
    }
  },
  // Reminder settings
  reminderEnabled: {
    type: Boolean,
    default: false
  },
  reminderDate: Date,
  // Tags for organization
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  // Whether this entry is public or private
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one entry per user per movie
watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });
watchlistSchema.index({ userId: 1, tmdbMovieId: 1 }, { unique: true });

// Index for common queries
watchlistSchema.index({ userId: 1, status: 1, dateAdded: -1 });
watchlistSchema.index({ userId: 1, priority: 1, dateAdded: -1 });
watchlistSchema.index({ reminderEnabled: 1, reminderDate: 1 });

// Virtual for user details
watchlistSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for movie details
watchlistSchema.virtual('movie', {
  ref: 'Movie',
  localField: 'movieId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to set watchedDate when status changes to watched
watchlistSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'watched' && !this.watchedDate) {
    this.watchedDate = new Date();
  }
  next();
});

// Instance method to mark as watched
watchlistSchema.methods.markAsWatched = async function(rating = null) {
  this.status = 'watched';
  this.watchedDate = new Date();
  if (rating) {
    this.userRating = rating;
  }
  await this.save();
};

// Instance method to update priority
watchlistSchema.methods.updatePriority = async function(priority) {
  this.priority = priority;
  await this.save();
};

// Static method to get user's watchlist
watchlistSchema.statics.getUserWatchlist = function(userId, options = {}) {
  const {
    status,
    priority,
    page = 1,
    limit = 20,
    sortBy = 'dateAdded',
    sortOrder = -1
  } = options;

  const query = { userId };
  if (status) query.status = status;
  if (priority) query.priority = priority;

  return this.find(query)
    .populate('movieId', 'title posterPath releaseDate genres averageRating')
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to get watchlist statistics for a user
watchlistSchema.statics.getUserWatchlistStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    want_to_watch: 0,
    watching: 0,
    watched: 0,
    dropped: 0,
    total: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

// Static method to get movies with reminders due
watchlistSchema.statics.getDueReminders = function() {
  return this.find({
    reminderEnabled: true,
    reminderDate: { $lte: new Date() },
    status: { $in: ['want_to_watch', 'watching'] }
  }).populate('userId', 'username email')
    .populate('movieId', 'title releaseDate');
};

// Static method to get popular movies in watchlists
watchlistSchema.statics.getPopularWatchlistMovies = function(limit = 10) {
  return this.aggregate([
    { $match: { status: 'want_to_watch' } },
    {
      $group: {
        _id: '$movieId',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'movies',
        localField: '_id',
        foreignField: '_id',
        as: 'movie'
      }
    },
    { $unwind: '$movie' },
    {
      $project: {
        _id: 0,
        movie: 1,
        watchlistCount: '$count'
      }
    }
  ]);
};

module.exports = mongoose.model('Watchlist', watchlistSchema);
