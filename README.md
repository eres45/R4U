# R4U – Reviews For You 🎬

A comprehensive, full-stack movie review platform built with modern technologies. Features user authentication, movie browsing, reviews, watchlists, and real-time TMDB integration.

## 🚀 Features

### Frontend Features
- **🎨 Modern UI/UX**: Netflix-inspired dark theme with smooth animations
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🔐 User Authentication**: Secure login/register with JWT tokens
- **🎬 Movie Browsing**: Browse popular, top-rated, upcoming, and now-playing movies
- **🔍 Advanced Search**: Search movies with filters and pagination
- **⭐ Review System**: Write, edit, and rate movie reviews
- **📝 Watchlist Management**: Personal movie tracking with status and priorities
- **🎥 Video Integration**: Watch trailers directly in the app
- **👤 User Profiles**: Personal dashboards with reviews and watchlists

### Backend Features
- **🛡️ Secure API**: RESTful API with JWT authentication and validation
- **🗄️ Database**: MongoDB with Mongoose ODM and optimized schemas
- **🔒 Security**: Password hashing, rate limiting, input validation
- **📊 Analytics**: User statistics and movie popularity tracking
- **🎯 Performance**: Pagination, indexing, and query optimization

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript for better development experience
- **Styled Components** - CSS-in-JS for component-scoped styling
- **React Router v6** - Client-side routing and navigation
- **Context API** - Global state management for auth and watchlist

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - Elegant MongoDB object modeling
- **JWT** - JSON Web Tokens for secure authentication
- **bcryptjs** - Password hashing and security

### External APIs
- **TMDB API** - The Movie Database for comprehensive movie data
- **YouTube API** - Embedded trailers and video content

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16.0.0 or later) - [Download here](https://nodejs.org/)
- **npm** (v8.0.0 or later) - Comes with Node.js
- **MongoDB** (v5.0 or later) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/eres45/R4U.git
cd R4U
```

### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env

# Add your TMDB API key to .env
REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3
```

### 3. Backend Setup
```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your environment variables in .env
```

### 4. Environment Configuration

#### Frontend (.env)
```bash
REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

#### Backend (server/.env)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/movie-review-platform

# Server
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# TMDB API
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3

# CORS
CLIENT_URL=http://localhost:3000
```

### 5. Get TMDB API Key
1. Visit [TMDB](https://www.themoviedb.org/settings/api)
2. Create an account and request an API key
3. Add the API key to both frontend and backend `.env` files

### 6. Start the Application

#### Start Backend Server
```bash
cd server
npm run dev
# Server will run on http://localhost:5000
```

#### Start Frontend Development Server
```bash
# In a new terminal, from project root
npm start
# App will run on http://localhost:3000
```

## 📁 Project Structure

```
R4U/
├── public/                 # Static files
├── src/                   # Frontend source code
│   ├── components/        # Reusable UI components
│   │   ├── Carousel.tsx   # Movie carousel with trailers
│   │   ├── Header.tsx     # Navigation header
│   │   ├── MovieCard.tsx  # Individual movie cards
│   │   ├── MovieGrid.tsx  # Grid layout for movies
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Home.tsx      # Landing page
│   │   ├── Movies.tsx    # Movie browsing page
│   │   ├── MovieDetail.tsx # Individual movie details
│   │   ├── Profile.tsx   # User profile page
│   │   └── ...
│   ├── contexts/         # React Context providers
│   │   ├── AuthContext.tsx    # Authentication state
│   │   └── WatchlistContext.tsx # Watchlist state
│   ├── hooks/            # Custom React hooks
│   │   └── useMovies.ts  # Movie-related hooks
│   ├── config/           # Configuration files
│   │   └── tmdb.ts       # TMDB API configuration
│   └── utils/            # Utility functions
├── server/               # Backend source code
│   ├── config/           # Server configuration
│   │   └── database.js   # MongoDB connection
│   ├── models/           # Mongoose schemas
│   │   ├── User.js       # User model
│   │   ├── Movie.js      # Movie model
│   │   ├── Review.js     # Review model
│   │   └── Watchlist.js  # Watchlist model
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── movies.js     # Movie routes
│   │   ├── reviews.js    # Review routes
│   │   ├── watchlist.js  # Watchlist routes
│   │   └── users.js      # User routes
│   ├── middleware/       # Express middleware
│   │   └── auth.js       # Authentication middleware
│   └── server.js         # Main server file
└── docs/                 # Documentation
    ├── API.md            # API documentation
    └── DATABASE.md       # Database schema documentation
```

## 🔧 Available Scripts

### Frontend Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### Backend Scripts
```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm test           # Run tests
```

## 🌐 API Endpoints

The backend provides a comprehensive REST API. See [API Documentation](./docs/API.md) for detailed endpoint information.

### Quick Reference
- **Authentication**: `/api/auth/*`
- **Movies**: `/api/movies/*`
- **Reviews**: `/api/reviews/*`
- **Watchlist**: `/api/watchlist/*`
- **Users**: `/api/users/*`

## 🗄️ Database Schema

The application uses MongoDB with the following collections:
- **Users**: User accounts and profiles
- **Movies**: Movie metadata from TMDB
- **Reviews**: User movie reviews and ratings
- **Watchlists**: User movie watchlists

See [Database Documentation](./docs/DATABASE.md) for detailed schema information.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Helmet Security**: Security headers and protection middleware

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
```bash
npm run build
# Deploy the build/ folder to your hosting service
```

### Backend Deployment (Heroku/Railway)
```bash
# Set environment variables on your hosting platform
# Deploy the server/ folder
```

### Environment Variables for Production
Make sure to set all environment variables in your production environment and use strong, unique values for JWT secrets.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing comprehensive movie data
- [React](https://reactjs.org/) team for the amazing framework
- [MongoDB](https://www.mongodb.com/) for the flexible database solution
- [Styled Components](https://styled-components.com/) for excellent CSS-in-JS solution

## 📞 Support

If you have any questions or need help with setup, please open an issue or contact the development team.

---

**Happy coding! 🎬✨**
