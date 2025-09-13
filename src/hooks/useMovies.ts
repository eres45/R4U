import { useCallback, useEffect, useState } from 'react';
import api, { TMDBMovie, TMDBMovieResponse, MovieCredits, Video } from '../config/tmdb';

type MovieCategory = 'popular' | 'top_rated' | 'upcoming' | 'now_playing';

/**
 * Custom hook to fetch movies by category with pagination
 * @param page - Page number for pagination (default: 1)
 * @param category - Movie category to fetch (popular, top_rated, upcoming, now_playing)
 * @returns Object containing movies array, loading state, error state, and total pages
 */
export const usePopularMovies = (page: number = 1, category: MovieCategory = 'popular') => {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        let data: TMDBMovieResponse;
        
        // Fetch movies based on selected category
        switch (category) {
          case 'top_rated':
            data = await api.getTopRatedMovies(page);
            break;
          case 'upcoming':
            data = await api.getUpcomingMovies(page);
            break;
          case 'now_playing':
            data = await api.getNowPlayingMovies(page);
            break;
          case 'popular':
          default:
            data = await api.getPopularMovies(page);
        }
        
        setMovies(data.results);
        // Limit to 500 pages as per TMDB API constraints
        setTotalPages(Math.min(data.total_pages, 500));
        setError(null);
      } catch (err) {
        setError('Failed to fetch movies. Please try again later.');
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page, category]); // Re-fetch when page or category changes

  return { movies, loading, error, totalPages };
};

interface Review {
  id: string;
  author: string;
  content: string;
  created_at: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
}

/**
 * Custom hook to fetch detailed movie information
 * @param movieId - TMDB movie ID
 * @returns Object containing movie details, loading state, and error state
 */
export const useMovieDetails = (movieId: number) => {
  const [movie, setMovie] = useState<import('../config/tmdb').MovieDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      // Early return if no movie ID provided
      if (!movieId) {
        console.log('No movieId provided to useMovieDetails');
        setLoading(false);
        return;
      }
      
      console.log(`Fetching details for movie ID: ${movieId}`);
      
      try {
        setLoading(true);
        console.log('Calling api.getMovieDetails...');
        const data = await api.getMovieDetails(movieId);
        console.log('Received movie data:', data);
        setMovie(data);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error fetching movie details:', errorMessage);
        setError(`Failed to fetch movie details: ${errorMessage}`);
      } finally {
        console.log('Finished loading movie details');
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]); // Re-fetch when movie ID changes

  return { movie, loading, error };
};

/**
 * Custom hook to fetch movie reviews with refetch capability
 * @param movieId - TMDB movie ID
 * @returns Object containing reviews array, loading state, error state, and refetch function
 */
export const useMovieReviews = (movieId: number) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized function to fetch reviews, prevents unnecessary re-renders
  const fetchMovieReviews = useCallback(async () => {
    if (!movieId) return;
    
    try {
      setLoading(true);
      const data = await api.getMovieReviews(movieId);
      setReviews(data.results);
      setError(null);
    } catch (err) {
      setError('Failed to fetch movie reviews. Please try again later.');
      console.error('Error fetching movie reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [movieId]); // Only recreate function when movieId changes

  useEffect(() => {
    fetchMovieReviews();
  }, [fetchMovieReviews]);

  return { reviews, loading, error, refetch: fetchMovieReviews };
};

/**
 * Custom hook for rating movies (currently mock implementation)
 * @returns Object containing rateMovie function, loading state, and error state
 */
export const useRateMovie = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const rateMovie = async (movieId: number, rating: number, reviewText?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual backend API call
      // This is currently a mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful response
      return {
        success: true,
        status_code: 1,
        status_message: 'Success.'
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit rating';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { rateMovie, loading, error };
};

export const useMovieVideos = (movieId: number) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieVideos = async () => {
      if (!movieId) return;
      
      try {
        setLoading(true);
        const data = await api.getMovieVideos(movieId);
        setVideos(data.results || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch movie videos. Please try again later.');
        console.error('Error fetching movie videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieVideos();
  }, [movieId]);

  return { videos, loading, error };
};

export const useMovieCredits = (movieId: number) => {
  const [credits, setCredits] = useState<MovieCredits | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieCredits = async () => {
      if (!movieId) return;
      
      try {
        setLoading(true);
        const data = await api.getMovieCredits(movieId);
        setCredits(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch movie credits. Please try again later.');
        console.error('Error fetching movie credits:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieCredits();
  }, [movieId]);

  return { credits, loading, error };
};

/**
 * Custom hook to fetch similar movies for a given movie
 * @param movieId - TMDB movie ID
 * @returns Object containing similar movies array, loading state, and error state
 */
export const useSimilarMovies = (movieId: number) => {
  const [similar, setSimilar] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarMovies = async () => {
      if (!movieId) return;
      
      try {
        setLoading(true);
        // Direct TMDB API call for similar movies
        // TODO: Consider moving this to the centralized API service
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=392d2c9c1ded201978e6c68dd91484b7&language=en-US&page=1`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch similar movies');
        }
        
        const data = await response.json();
        // Ensure we have a results array, fallback to empty array
        setSimilar(data.results || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch similar movies. Please try again later.');
        console.error('Error fetching similar movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarMovies();
  }, [movieId]); // Re-fetch when movie ID changes

  return { similar, loading, error };
};
