const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  originalTitle: {
    type: String,
    trim: true
  },
  overview: {
    type: String,
    maxlength: [2000, 'Overview cannot exceed 2000 characters']
  },
  genres: [{
    id: Number,
    name: String
  }],
  releaseDate: {
    type: Date,
    index: true
  },
  runtime: {
    type: Number,
    min: [1, 'Runtime must be at least 1 minute']
  },
  director: {
    type: String,
    trim: true
  },
  cast: [{
    id: Number,
    name: String,
    character: String,
    profilePath: String,
    order: Number
  }],
  posterPath: String,
  backdropPath: String,
  tagline: String,
  status: {
    type: String,
    enum: ['Rumored', 'Planned', 'In Production', 'Post Production', 'Released', 'Canceled']
  },
  budget: {
    type: Number,
    min: 0
  },
  revenue: {
    type: Number,
    min: 0
  },
  originalLanguage: String,
  spokenLanguages: [{
    iso_639_1: String,
    name: String
  }],
  productionCompanies: [{
    id: Number,
    name: String,
    logoPath: String,
    originCountry: String
  }],
  productionCountries: [{
    iso_3166_1: String,
    name: String
  }],
  // TMDB ratings
  tmdbVoteAverage: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  tmdbVoteCount: {
    type: Number,
    min: 0,
    default: 0
  },
  // Our platform ratings (calculated from reviews)
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    min: 0,
    default: 0
  },
  // Popularity and trending
  popularity: {
    type: Number,
    default: 0
  },
  adult: {
    type: Boolean,
    default: false
  },
  // Videos (trailers, teasers, etc.)
  videos: [{
    id: String,
    key: String,
    name: String,
    site: String,
    type: String,
    size: Number,
    official: Boolean
  }],
  // Last time data was synced from TMDB
  lastSyncDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reviews
movieSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'movieId'
});

// Virtual for watchlist entries
movieSchema.virtual('watchlistEntries', {
  ref: 'Watchlist',
  localField: '_id',
  foreignField: 'movieId'
});

// Index for text search
movieSchema.index({
  title: 'text',
  originalTitle: 'text',
  overview: 'text',
  'cast.name': 'text',
  director: 'text'
});

// Compound indexes for common queries
movieSchema.index({ releaseDate: -1, averageRating: -1 });
movieSchema.index({ 'genres.name': 1, averageRating: -1 });
movieSchema.index({ popularity: -1 });

// Method to update average rating
movieSchema.methods.updateAverageRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { movieId: this._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.averageRating = Math.round(stats[0].averageRating * 10) / 10;
    this.reviewCount = stats[0].reviewCount;
  } else {
    this.averageRating = 0;
    this.reviewCount = 0;
  }

  await this.save();
};

// Static method to find movies by genre
movieSchema.statics.findByGenre = function(genreName) {
  return this.find({ 'genres.name': genreName });
};

// Static method to get trending movies
movieSchema.statics.getTrending = function(limit = 20) {
  return this.find()
    .sort({ popularity: -1, averageRating: -1 })
    .limit(limit);
};

// Static method to get top rated movies
movieSchema.statics.getTopRated = function(limit = 20) {
  return this.find({ reviewCount: { $gte: 5 } })
    .sort({ averageRating: -1, reviewCount: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Movie', movieSchema);
