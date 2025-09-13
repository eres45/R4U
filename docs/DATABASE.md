# Database Schema Documentation

## Overview

The Movie Review Platform uses MongoDB as its primary database with Mongoose ODM for data modeling. The database is designed with four main collections that handle user management, movie data, reviews, and watchlists.

## Collections

### 1. Users Collection

Stores user account information and authentication data.

**Schema:**
```javascript
{
  _id: ObjectId,
  username: String (required, unique, 3-30 chars),
  email: String (required, unique, valid email),
  password: String (required, hashed with bcrypt),
  profilePicture: String (URL, optional),
  joinDate: Date (default: current date),
  role: String (enum: ['user', 'moderator', 'admin'], default: 'user'),
  isActive: Boolean (default: true),
  lastLoginDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `username` (unique)
- `email` (unique)
- `isActive`
- `role`

**Virtuals:**
- `reviews` - References to user's reviews
- `watchlist` - References to user's watchlist items

**Methods:**
- `comparePassword(password)` - Compare plain text password with hashed password
- `getPublicProfile()` - Return user data without sensitive information
- `findByEmailOrUsername(identifier)` - Static method to find user by email or username

### 2. Movies Collection

Stores movie information synchronized from TMDB API.

**Schema:**
```javascript
{
  _id: ObjectId,
  tmdbId: Number (required, unique, TMDB movie ID),
  title: String (required),
  overview: String,
  releaseDate: Date,
  runtime: Number (minutes),
  genres: [{
    id: Number,
    name: String
  }],
  cast: [{
    id: Number,
    name: String,
    character: String,
    profilePath: String
  }],
  director: String,
  posterPath: String (TMDB poster path),
  backdropPath: String (TMDB backdrop path),
  averageRating: Number (calculated from reviews),
  popularity: Number (TMDB popularity score),
  videos: [{
    id: String,
    key: String (YouTube key),
    name: String,
    site: String,
    type: String (Trailer, Teaser, etc.)
  }],
  lastSyncDate: Date (last TMDB sync),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `tmdbId` (unique)
- `title` (text index for search)
- `releaseDate`
- `averageRating`
- `popularity`
- `genres.name`

**Virtuals:**
- `reviews` - References to movie reviews
- `watchlistEntries` - References to watchlist entries

**Methods:**
- `updateAverageRating()` - Recalculate average rating from reviews
- `getTrending(limit)` - Static method to get trending movies
- `getTopRated(limit)` - Static method to get top-rated movies

### 3. Reviews Collection

Stores user reviews and ratings for movies.

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required, ref: 'User'),
  movieId: ObjectId (required, ref: 'Movie'),
  tmdbMovieId: Number (required, TMDB movie ID),
  rating: Number (required, 1-5, allows half ratings),
  reviewText: String (required, 10-2000 chars),
  title: String (optional, max 100 chars),
  helpfulVotes: Number (default: 0),
  helpfulBy: [ObjectId] (users who voted helpful),
  status: String (enum: ['pending', 'approved', 'rejected', 'flagged'], default: 'approved'),
  flaggedBy: [{
    userId: ObjectId (ref: 'User'),
    reason: String (enum: ['spam', 'inappropriate', 'offensive', 'spoiler', 'other']),
    flaggedAt: Date
  }],
  containsSpoilers: Boolean (default: false),
  isVerifiedPurchase: Boolean (default: false),
  lastEditedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1, movieId: 1 }` (unique compound - one review per user per movie)
- `{ userId: 1, tmdbMovieId: 1 }` (unique compound)
- `createdAt` (descending)
- `rating` (descending)
- `helpfulVotes` (descending)
- `{ status: 1, createdAt: -1 }`

**Virtuals:**
- `user` - Reference to user who wrote the review
- `movie` - Reference to the movie being reviewed

**Methods:**
- `isHelpfulBy(userId)` - Check if user voted this review as helpful
- `toggleHelpfulVote(userId)` - Add or remove helpful vote
- `getMovieReviews(movieId, options)` - Static method to get reviews for a movie
- `getUserReviews(userId, options)` - Static method to get user's reviews
- `getRecentReviews(limit)` - Static method to get recent reviews

### 4. Watchlist Collection

Stores user's personal movie watchlists with tracking status.

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required, ref: 'User'),
  movieId: ObjectId (required, ref: 'Movie'),
  tmdbMovieId: Number (required, TMDB movie ID),
  dateAdded: Date (default: current date),
  priority: String (enum: ['low', 'medium', 'high'], default: 'medium'),
  notes: String (optional, max 500 chars),
  status: String (enum: ['want_to_watch', 'watching', 'watched', 'dropped'], default: 'want_to_watch'),
  watchedDate: Date (set when status becomes 'watched'),
  userRating: Number (1-5, required when status is 'watched'),
  reminderEnabled: Boolean (default: false),
  reminderDate: Date,
  tags: [String] (max 20 chars each),
  isPublic: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1, movieId: 1 }` (unique compound - one entry per user per movie)
- `{ userId: 1, tmdbMovieId: 1 }` (unique compound)
- `{ userId: 1, status: 1, dateAdded: -1 }`
- `{ userId: 1, priority: 1, dateAdded: -1 }`
- `{ reminderEnabled: 1, reminderDate: 1 }`

**Virtuals:**
- `user` - Reference to the user
- `movie` - Reference to the movie

**Methods:**
- `markAsWatched(rating)` - Mark movie as watched with optional rating
- `updatePriority(priority)` - Update priority level
- `getUserWatchlist(userId, options)` - Static method to get user's watchlist
- `getUserWatchlistStats(userId)` - Static method to get watchlist statistics
- `getDueReminders()` - Static method to get movies with due reminders
- `getPopularWatchlistMovies(limit)` - Static method to get popular movies in watchlists

## Relationships

### User → Reviews (One-to-Many)
- One user can have multiple reviews
- Each review belongs to one user
- Foreign key: `reviews.userId → users._id`

### User → Watchlist (One-to-Many)
- One user can have multiple watchlist entries
- Each watchlist entry belongs to one user
- Foreign key: `watchlist.userId → users._id`

### Movie → Reviews (One-to-Many)
- One movie can have multiple reviews
- Each review is for one movie
- Foreign key: `reviews.movieId → movies._id`

### Movie → Watchlist (One-to-Many)
- One movie can be in multiple users' watchlists
- Each watchlist entry is for one movie
- Foreign key: `watchlist.movieId → movies._id`

## Data Integrity Rules

### Constraints
1. **Unique Reviews**: Each user can only review a movie once
2. **Unique Watchlist**: Each user can only add a movie to their watchlist once
3. **Rating Validation**: Ratings must be between 1-5 (allows 0.5 increments)
4. **Status Validation**: Watchlist status must be one of the defined enum values
5. **Required Fields**: All required fields must be present and valid

### Cascading Operations
1. **User Deletion**: When a user is deleted (soft delete by setting `isActive: false`):
   - Reviews remain but are marked as from inactive user
   - Watchlist entries remain but are inaccessible

2. **Movie Deletion**: Movies are rarely deleted, but if removed:
   - Associated reviews are marked as orphaned
   - Watchlist entries are marked as unavailable

### Validation Rules

#### User Validation
- Username: 3-30 characters, alphanumeric and underscores only
- Email: Must be valid email format
- Password: Minimum 6 characters (hashed before storage)

#### Review Validation
- Rating: Required, must be 1-5 (allows 0.5 increments)
- Review Text: Required, 10-2000 characters
- Title: Optional, maximum 100 characters

#### Watchlist Validation
- Priority: Must be 'low', 'medium', or 'high'
- Status: Must be 'want_to_watch', 'watching', 'watched', or 'dropped'
- Notes: Optional, maximum 500 characters
- User Rating: Required when status is 'watched', must be 1-5

## Performance Optimizations

### Indexing Strategy
1. **Compound Indexes**: Used for common query patterns
   - `{ userId: 1, movieId: 1 }` for user-movie lookups
   - `{ status: 1, createdAt: -1 }` for filtered lists

2. **Single Field Indexes**: Used for sorting and filtering
   - `createdAt`, `rating`, `helpfulVotes` for reviews
   - `averageRating`, `popularity` for movies

3. **Text Indexes**: Used for search functionality
   - `title` field in movies collection

### Query Optimization
1. **Pagination**: All list endpoints use skip/limit for pagination
2. **Selective Fields**: Use `.select()` to limit returned fields
3. **Population**: Efficient population of related documents
4. **Aggregation**: Use aggregation pipelines for complex queries

## Backup and Migration

### Backup Strategy
1. **Daily Backups**: Automated daily backups of entire database
2. **Collection-Level Backups**: Individual collection backups before major updates
3. **Point-in-Time Recovery**: Transaction logs for point-in-time recovery

### Migration Scripts
1. **Schema Updates**: Versioned migration scripts for schema changes
2. **Data Transformations**: Scripts for data format changes
3. **Index Management**: Scripts for adding/removing indexes

## Security Considerations

### Data Protection
1. **Password Hashing**: All passwords hashed with bcrypt (salt rounds: 12)
2. **Sensitive Data**: No sensitive data stored in plain text
3. **Input Validation**: All inputs validated before database operations

### Access Control
1. **Authentication**: JWT-based authentication for API access
2. **Authorization**: Role-based access control (user, moderator, admin)
3. **Data Isolation**: Users can only access their own data (except public data)

### Audit Trail
1. **Timestamps**: All documents have createdAt/updatedAt timestamps
2. **User Actions**: Track user actions for reviews and watchlist changes
3. **Admin Actions**: Log all administrative actions

## Monitoring and Maintenance

### Performance Monitoring
1. **Query Performance**: Monitor slow queries and optimize indexes
2. **Connection Pool**: Monitor database connection usage
3. **Storage Usage**: Track database size and growth patterns

### Regular Maintenance
1. **Index Optimization**: Regular analysis and optimization of indexes
2. **Data Cleanup**: Remove orphaned or invalid data
3. **Statistics Update**: Update collection statistics for query optimization

## Example Queries

### Common Query Patterns

#### Get User's Watchlist with Movie Details
```javascript
db.watchlists.aggregate([
  { $match: { userId: ObjectId("user_id") } },
  { $lookup: {
    from: "movies",
    localField: "movieId",
    foreignField: "_id",
    as: "movie"
  }},
  { $unwind: "$movie" },
  { $sort: { dateAdded: -1 } }
])
```

#### Get Movie Reviews with User Information
```javascript
db.reviews.aggregate([
  { $match: { movieId: ObjectId("movie_id"), status: "approved" } },
  { $lookup: {
    from: "users",
    localField: "userId",
    foreignField: "_id",
    as: "user"
  }},
  { $unwind: "$user" },
  { $sort: { helpfulVotes: -1, createdAt: -1 } }
])
```

#### Get Top Reviewers
```javascript
db.reviews.aggregate([
  { $match: { status: "approved" } },
  { $group: {
    _id: "$userId",
    reviewCount: { $sum: 1 },
    averageRating: { $avg: "$rating" }
  }},
  { $sort: { reviewCount: -1 } },
  { $limit: 10 },
  { $lookup: {
    from: "users",
    localField: "_id",
    foreignField: "_id",
    as: "user"
  }}
])
```
