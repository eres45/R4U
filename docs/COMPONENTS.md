# Component Documentation

## Overview

This document provides detailed information about the React components used in the Movie Review Platform, including their props, usage examples, and implementation details.

## Core Components

### Carousel Component

**Location:** `src/components/Carousel.tsx`

**Purpose:** Displays a rotating carousel of featured movies with trailer playback functionality.

**Props:**
```typescript
interface CarouselProps {
  movies: FilteredMovie[];
  autoPlay?: boolean;
  interval?: number;
}

interface FilteredMovie extends TMDBMovie {
  backdrop_path: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}
```

**Features:**
- Auto-advancing slides with configurable interval
- Manual navigation with previous/next buttons
- Play trailer functionality with YouTube integration
- Navigate to movie detail page
- Responsive design with mobile optimization

**Usage Example:**
```tsx
import Carousel from '../components/Carousel';

<Carousel 
  movies={nowPlayingMovies.slice(0, 5)}
  autoPlay={true}
  interval={5000}
/>
```

**Key Methods:**
- `nextSlide()` - Advance to next movie
- `prevSlide()` - Go to previous movie
- `goToSlide(index)` - Jump to specific slide
- `playTrailer()` - Open trailer modal
- `navigateToMovie()` - Navigate to movie detail page

### MovieGrid Component

**Location:** `src/components/MovieGrid.tsx`

**Purpose:** Displays movies in a responsive grid layout with loading and error states.

**Props:**
```typescript
interface MovieGridProps {
  movies: TMDBMovie[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}
```

**Features:**
- Responsive grid layout (auto-fill with minimum 200px columns)
- Loading state with skeleton animation
- Error handling with user-friendly messages
- Empty state with customizable message
- Hover effects and smooth transitions

**Usage Example:**
```tsx
import MovieGrid from '../components/MovieGrid';

<MovieGrid 
  movies={movies} 
  loading={loading}
  error={error}
  emptyMessage="No movies found for your search."
/>
```

### MovieCard Component

**Location:** `src/components/MovieCard.tsx`

**Purpose:** Individual movie card with poster, title, and rating information.

**Props:**
```typescript
interface MovieCardProps {
  movie: TMDBMovie;
  onClick?: () => void;
  showRating?: boolean;
}
```

**Features:**
- Movie poster with fallback image
- Title with text overflow handling
- Rating badge with star icon
- Hover animations and effects
- Click handling for navigation

**Usage Example:**
```tsx
import MovieCard from '../components/MovieCard';

<MovieCard 
  movie={movie}
  onClick={() => navigate(`/movie/${movie.id}`)}
  showRating={true}
/>
```

### Header Component

**Location:** `src/components/Header.tsx`

**Purpose:** Main navigation header with authentication and menu items.

**Features:**
- Responsive navigation menu
- User authentication status display
- Mobile hamburger menu
- Search functionality
- User profile dropdown

**Navigation Items:**
- Home (`/`)
- Movies (`/movies`)
- Profile (`/profile`) - Protected route
- Login/Logout functionality

**Usage Example:**
```tsx
import Header from '../components/Header';

// Used in App.tsx
<Header />
```

### ProtectedRoute Component

**Location:** `src/components/ProtectedRoute.tsx`

**Purpose:** Route wrapper that requires user authentication.

**Props:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}
```

**Features:**
- Checks authentication status
- Redirects to login if not authenticated
- Preserves intended destination for post-login redirect

**Usage Example:**
```tsx
import ProtectedRoute from '../components/ProtectedRoute';

<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>
```

## Page Components

### Home Page

**Location:** `src/pages/Home.tsx`

**Purpose:** Landing page with featured content and movie sections.

**Features:**
- Hero carousel with now-playing movies
- Multiple movie sections (Now Playing, Popular)
- Loading states and error handling
- Responsive layout

**Sections:**
- Featured carousel
- Now in Theaters
- Popular Movies

### Movies Page

**Location:** `src/pages/Movies.tsx`

**Purpose:** Browse movies with filtering and pagination.

**Features:**
- Category filters (Popular, Top Rated, Upcoming, Now Playing)
- Pagination with page navigation
- Responsive movie grid
- Loading and error states

**Filter Options:**
- Popular movies
- Top rated movies
- Upcoming releases
- Now playing in theaters

### MovieDetail Page

**Location:** `src/pages/MovieDetail.tsx`

**Purpose:** Detailed movie information with reviews and actions.

**Features:**
- Movie information display
- Cast and crew information
- User reviews section
- Watchlist functionality
- Similar movies recommendations
- Trailer integration

**Sections:**
- Movie hero section
- Cast & crew
- User reviews
- Write review form
- Similar movies

### Profile Page

**Location:** `src/pages/Profile.tsx`

**Purpose:** User dashboard with personal information and activity.

**Features:**
- User information display
- Personal watchlist
- User's reviews
- Account settings

**Sections:**
- User profile information
- Watchlist management
- Review history
- Account preferences

## Context Providers

### AuthContext

**Location:** `src/contexts/AuthContext.tsx`

**Purpose:** Global authentication state management.

**State:**
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}
```

**Features:**
- User authentication state
- Login/logout functionality
- User registration
- Persistent authentication via localStorage
- Loading states

**Usage Example:**
```tsx
import { useAuth } from '../contexts/AuthContext';

const { user, login, logout, isAuthenticated } = useAuth();
```

### WatchlistContext

**Location:** `src/contexts/WatchlistContext.tsx`

**Purpose:** Global watchlist state management.

**State:**
```typescript
interface WatchlistContextType {
  watchlist: WatchlistItem[];
  addToWatchlist: (movie: TMDBMovie) => void;
  removeFromWatchlist: (movieId: number) => void;
  isInWatchlist: (movieId: number) => boolean;
  clearWatchlist: () => void;
}
```

**Features:**
- Watchlist state management
- Add/remove movies
- Check if movie is in watchlist
- Persistent storage via localStorage

**Usage Example:**
```tsx
import { useWatchlist } from '../contexts/WatchlistContext';

const { watchlist, addToWatchlist, isInWatchlist } = useWatchlist();
```

## Custom Hooks

### useMovies Hook

**Location:** `src/hooks/useMovies.ts`

**Purpose:** Custom hooks for movie-related API calls and state management.

**Available Hooks:**

#### usePopularMovies
```typescript
const usePopularMovies = (page: number, category: MovieCategory) => {
  return { movies, loading, error, totalPages };
}
```

#### useMovieDetails
```typescript
const useMovieDetails = (movieId: number) => {
  return { movie, loading, error };
}
```

#### useMovieReviews
```typescript
const useMovieReviews = (movieId: number) => {
  return { reviews, loading, error, refetch };
}
```

#### useMovieVideos
```typescript
const useMovieVideos = (movieId: number) => {
  return { videos, loading, error };
}
```

#### useMovieCredits
```typescript
const useMovieCredits = (movieId: number) => {
  return { credits, loading, error };
}
```

#### useSimilarMovies
```typescript
const useSimilarMovies = (movieId: number) => {
  return { similar, loading, error };
}
```

## Styling Approach

### Styled Components

The application uses styled-components for CSS-in-JS styling with the following patterns:

**Theme Variables:**
```typescript
const theme = {
  colors: {
    primary: '#e50914',
    background: '#141414',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)'
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px'
  }
};
```

**Responsive Design:**
```typescript
const Container = styled.div`
  padding: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 1rem;
  }
`;
```

**Component Styling Pattern:**
```typescript
const StyledComponent = styled.div<{ $active?: boolean }>`
  background: ${props => props.$active ? '#e50914' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;
```

## Performance Optimizations

### React.memo Usage
```typescript
const MovieCard = React.memo<MovieCardProps>(({ movie, onClick }) => {
  // Component implementation
});
```

### useCallback for Event Handlers
```typescript
const handleClick = useCallback(() => {
  onClick?.(movie.id);
}, [onClick, movie.id]);
```

### useMemo for Expensive Calculations
```typescript
const filteredMovies = useMemo(() => {
  return movies.filter(movie => movie.vote_average > 7);
}, [movies]);
```

## Error Handling Patterns

### Component Error Boundaries
```typescript
const ErrorFallback = ({ error }: { error: Error }) => (
  <div role="alert">
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
  </div>
);
```

### Loading States
```typescript
if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message={error} />;
}
```

### Empty States
```typescript
if (!movies.length) {
  return <EmptyState message="No movies found" />;
}
```

## Accessibility Features

### Semantic HTML
- Proper heading hierarchy (h1, h2, h3)
- ARIA labels and roles
- Focus management for modals
- Keyboard navigation support

### Screen Reader Support
```typescript
<button aria-label="Play trailer for {movie.title}">
  <PlayIcon />
</button>
```

### Color Contrast
- High contrast ratios for text
- Focus indicators for interactive elements
- Alternative text for images

## Testing Considerations

### Component Testing
```typescript
import { render, screen } from '@testing-library/react';
import MovieCard from './MovieCard';

test('renders movie title', () => {
  render(<MovieCard movie={mockMovie} />);
  expect(screen.getByText(mockMovie.title)).toBeInTheDocument();
});
```

### Hook Testing
```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useMovies } from './useMovies';

test('fetches movies on mount', () => {
  const { result } = renderHook(() => useMovies());
  expect(result.current.loading).toBe(true);
});
```

## Best Practices

### Component Organization
1. **Single Responsibility**: Each component has one clear purpose
2. **Composition over Inheritance**: Use composition for complex components
3. **Props Interface**: Always define TypeScript interfaces for props
4. **Default Props**: Provide sensible defaults for optional props

### State Management
1. **Local State**: Use useState for component-specific state
2. **Global State**: Use Context API for app-wide state
3. **Server State**: Use custom hooks for API data
4. **Derived State**: Use useMemo for computed values

### Performance
1. **Memoization**: Use React.memo, useMemo, useCallback appropriately
2. **Code Splitting**: Lazy load components when possible
3. **Image Optimization**: Use appropriate image sizes and formats
4. **Bundle Analysis**: Regular bundle size monitoring
