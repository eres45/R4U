# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "profilePicture": "avatar_url",
      "joinDate": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "identifier": "john@example.com", // email or username
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "profilePicture": "avatar_url",
      "joinDate": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### GET /auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "profilePicture": "avatar_url",
      "joinDate": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /auth/profile
Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com",
  "profilePicture": "new_avatar_url"
}
```

### POST /auth/change-password
Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

## Movie Endpoints

### GET /movies
Get movies with filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 50)
- `genre` (optional): Filter by genre name
- `year` (optional): Filter by release year
- `sort` (optional): Sort field (title, releaseDate, averageRating, popularity)
- `order` (optional): Sort order (asc, desc)
- `search` (optional): Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "movies": [
      {
        "_id": "movie_id",
        "tmdbId": 123456,
        "title": "Movie Title",
        "overview": "Movie description",
        "releaseDate": "2024-01-01T00:00:00.000Z",
        "runtime": 120,
        "genres": [
          {"id": 28, "name": "Action"},
          {"id": 12, "name": "Adventure"}
        ],
        "posterPath": "/poster.jpg",
        "backdropPath": "/backdrop.jpg",
        "averageRating": 4.5,
        "popularity": 85.2
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 10,
      "total": 200,
      "limit": 20
    }
  }
}
```

### GET /movies/trending
Get trending movies.

**Query Parameters:**
- `limit` (optional): Number of movies to return (default: 20)

### GET /movies/top-rated
Get top-rated movies.

**Query Parameters:**
- `limit` (optional): Number of movies to return (default: 20)

### GET /movies/:id
Get movie details by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "movie": {
      "_id": "movie_id",
      "tmdbId": 123456,
      "title": "Movie Title",
      "overview": "Movie description",
      "releaseDate": "2024-01-01T00:00:00.000Z",
      "runtime": 120,
      "genres": [
        {"id": 28, "name": "Action"}
      ],
      "cast": [
        {
          "id": 123,
          "name": "Actor Name",
          "character": "Character Name",
          "profilePath": "/actor.jpg"
        }
      ],
      "director": "Director Name",
      "posterPath": "/poster.jpg",
      "backdropPath": "/backdrop.jpg",
      "averageRating": 4.5,
      "videos": [
        {
          "id": "video_id",
          "key": "youtube_key",
          "name": "Official Trailer",
          "site": "YouTube",
          "type": "Trailer"
        }
      ]
    }
  }
}
```

### GET /movies/tmdb/:tmdbId
Get movie by TMDB ID.

### POST /movies
Create/sync movie from TMDB (used internally for data synchronization).

## Review Endpoints

### GET /reviews
Get reviews with filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `movieId` (optional): Filter by movie ID
- `userId` (optional): Filter by user ID
- `minRating` (optional): Minimum rating filter (1-5)
- `maxRating` (optional): Maximum rating filter (1-5)
- `sort` (optional): Sort field (createdAt, rating, helpfulVotes)
- `order` (optional): Sort order (asc, desc)

### GET /reviews/movie/:movieId
Get reviews for a specific movie.

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "review_id",
        "userId": {
          "_id": "user_id",
          "username": "johndoe",
          "profilePicture": "avatar_url",
          "joinDate": "2024-01-01T00:00:00.000Z"
        },
        "movieId": "movie_id",
        "rating": 5,
        "reviewText": "Great movie!",
        "title": "Amazing Experience",
        "helpfulVotes": 10,
        "containsSpoilers": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 50,
      "limit": 10
    }
  }
}
```

### GET /reviews/user/:userId
Get reviews by a specific user.

### GET /reviews/recent
Get recent reviews.

**Query Parameters:**
- `limit` (optional): Number of reviews to return (default: 10)

### POST /reviews
Create a new review.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "movieId": "movie_id",
  "tmdbMovieId": 123456,
  "rating": 5,
  "reviewText": "This movie was absolutely amazing!",
  "title": "Best Movie Ever",
  "containsSpoilers": false
}
```

### PUT /reviews/:id
Update a review.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rating": 4,
  "reviewText": "Updated review text",
  "title": "Updated Title",
  "containsSpoilers": true
}
```

### DELETE /reviews/:id
Delete a review.

**Headers:** `Authorization: Bearer <token>`

### POST /reviews/:id/helpful
Toggle helpful vote for a review.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Helpful vote added",
  "data": {
    "helpfulVotes": 11,
    "userVoted": true
  }
}
```

## Watchlist Endpoints

### GET /watchlist
Get user's watchlist.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status (want_to_watch, watching, watched, dropped)
- `priority` (optional): Filter by priority (low, medium, high)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 50)
- `sort` (optional): Sort field (dateAdded, priority, title)
- `order` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "watchlist": [
      {
        "_id": "watchlist_id",
        "userId": "user_id",
        "movieId": {
          "_id": "movie_id",
          "title": "Movie Title",
          "posterPath": "/poster.jpg",
          "releaseDate": "2024-01-01T00:00:00.000Z",
          "genres": [{"id": 28, "name": "Action"}],
          "averageRating": 4.5
        },
        "tmdbMovieId": 123456,
        "status": "want_to_watch",
        "priority": "high",
        "notes": "Must watch this weekend",
        "dateAdded": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 3,
      "total": 50,
      "limit": 20
    }
  }
}
```

### GET /watchlist/stats
Get user's watchlist statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "want_to_watch": 25,
      "watching": 3,
      "watched": 15,
      "dropped": 2,
      "total": 45
    }
  }
}
```

### POST /watchlist
Add movie to watchlist.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "movieId": "movie_id",
  "tmdbMovieId": 123456,
  "priority": "high",
  "notes": "Recommended by friend",
  "status": "want_to_watch"
}
```

### PUT /watchlist/:id
Update watchlist item.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "priority": "medium",
  "notes": "Updated notes",
  "status": "watching",
  "userRating": 4
}
```

### DELETE /watchlist/:id
Remove movie from watchlist.

**Headers:** `Authorization: Bearer <token>`

### POST /watchlist/:id/watched
Mark movie as watched.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rating": 5
}
```

### GET /watchlist/check/:tmdbId
Check if movie is in user's watchlist.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "inWatchlist": true,
    "item": {
      "_id": "watchlist_id",
      "status": "want_to_watch",
      "priority": "high",
      "dateAdded": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## User Endpoints

### GET /users/:id
Get user profile by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "profilePicture": "avatar_url",
      "joinDate": "2024-01-01T00:00:00.000Z",
      "reviewCount": 25,
      "watchlistCount": 45
    }
  }
}
```

### GET /users/:id/reviews
Get user's reviews.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)

### GET /users/:id/watchlist
Get user's public watchlist.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 50)
- `status` (optional): Filter by status

### GET /users
Search users.

**Query Parameters:**
- `search` (optional): Search term for username or email
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 50)

### GET /users/stats/top-reviewers
Get top reviewers.

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "topReviewers": [
      {
        "user": {
          "_id": "user_id",
          "username": "johndoe",
          "profilePicture": "avatar_url",
          "joinDate": "2024-01-01T00:00:00.000Z"
        },
        "reviewCount": 150,
        "averageRating": 4.2
      }
    ]
  }
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP

When rate limit is exceeded, the API returns:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

## Validation Rules

### User Registration
- **Username**: 3-30 characters, alphanumeric and underscores only
- **Email**: Valid email format
- **Password**: Minimum 6 characters

### Reviews
- **Rating**: Integer between 1 and 5
- **Review Text**: 10-2000 characters
- **Title**: Maximum 100 characters (optional)

### Watchlist
- **Priority**: One of: low, medium, high
- **Status**: One of: want_to_watch, watching, watched, dropped
- **Notes**: Maximum 500 characters (optional)
- **User Rating**: Integer between 1 and 5 (required when status is "watched")

## Examples

### Complete User Flow Example

1. **Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "moviefan",
    "email": "fan@movies.com",
    "password": "securepass123"
  }'
```

2. **Login and get token:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "fan@movies.com",
    "password": "securepass123"
  }'
```

3. **Add movie to watchlist:**
```bash
curl -X POST http://localhost:5000/api/watchlist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "movieId": "movie_object_id",
    "tmdbMovieId": 123456,
    "priority": "high",
    "notes": "Must watch this weekend"
  }'
```

4. **Write a review:**
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "movieId": "movie_object_id",
    "tmdbMovieId": 123456,
    "rating": 5,
    "reviewText": "Absolutely amazing movie! Great acting and storyline.",
    "title": "Must Watch!"
  }'
```
