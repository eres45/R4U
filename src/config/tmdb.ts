const API_KEY = '392d2c9c1ded201978e6c68dd91484b7';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const headers = {
  'Content-Type': 'application/json;charset=utf-8',
  'Accept': 'application/json'
};

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  popularity: number;
}

export interface MovieDetails extends TMDBMovie {
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string;
  status: string;
  revenue: number;
  budget: number;
  homepage: string;
  imdb_id: string;
}

export interface Review {
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

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface Cast {
  cast_id: number;
  character: string;
  credit_id: string;
  gender: number;
  id: number;
  name: string;
  order: number;
  profile_path: string | null;
}

export interface Cast {
  cast_id: number;
  character: string;
  credit_id: string;
  gender: number;
  id: number;
  name: string;
  order: number;
  profile_path: string | null;
}

export interface Crew {
  credit_id: string;
  department: string;
  gender: number;
  id: number;
  job: string;
  name: string;
  profile_path: string | null;
}

export interface MovieCredits {
  id: number;
  cast: Cast[];
  crew: Crew[];
}

export interface VideoResponse {
  id: number;
  results: Video[];
}

export interface TMDBMovieResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

// Helper function to fetch movies by category
const fetchMoviesByCategory = async (category: string, page: number = 1): Promise<TMDBMovieResponse> => {
  const url = new URL(`${BASE_URL}/movie/${category}`);
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('language', 'en-US');
  url.searchParams.append('page', page.toString());
  
  const response = await fetch(url.toString(), { headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API Error:', errorData);
    throw new Error(`Failed to fetch ${category} movies: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

const api = {
  // Get popular movies
  getPopularMovies: (page: number = 1): Promise<TMDBMovieResponse> => 
    fetchMoviesByCategory('popular', page),

  // Get top rated movies
  getTopRatedMovies: (page: number = 1): Promise<TMDBMovieResponse> => 
    fetchMoviesByCategory('top_rated', page),

  // Get upcoming movies
  getUpcomingMovies: (page: number = 1): Promise<TMDBMovieResponse> => 
    fetchMoviesByCategory('upcoming', page),

  // Get now playing movies
  getNowPlayingMovies: (page: number = 1): Promise<TMDBMovieResponse> => 
    fetchMoviesByCategory('now_playing', page),

  // Get movie details
  getMovieDetails: async (id: number): Promise<MovieDetails> => {
    const url = new URL(`${BASE_URL}/movie/${id}`);
    url.searchParams.append('api_key', API_KEY);
    url.searchParams.append('language', 'en-US');
    
    const response = await fetch(url.toString(), { headers });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Movie Details Error:', errorData);
      throw new Error('Failed to fetch movie details');
    }
    
    return response.json();
  },

  // Get movie reviews
  getMovieReviews: async (id: number): Promise<{ results: Review[] }> => {
    const url = new URL(`${BASE_URL}/movie/${id}/reviews`);
    url.searchParams.append('api_key', API_KEY);
    url.searchParams.append('language', 'en-US');
    
    const response = await fetch(url.toString(), { headers });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Movie Reviews Error:', errorData);
      throw new Error(`Failed to fetch movie reviews: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get movie videos
  getMovieVideos: async (id: number): Promise<VideoResponse> => {
    const url = new URL(`${BASE_URL}/movie/${id}/videos`);
    url.searchParams.append('api_key', API_KEY);
    url.searchParams.append('language', 'en-US');
    
    const response = await fetch(url.toString(), { headers });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Movie Videos Error:', errorData);
      throw new Error(`Failed to fetch movie videos: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get movie credits
  getMovieCredits: async (id: number): Promise<MovieCredits> => {
    const url = new URL(`${BASE_URL}/movie/${id}/credits`);
    url.searchParams.append('api_key', API_KEY);
    url.searchParams.append('language', 'en-US');
    
    const response = await fetch(url.toString(), { headers });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Movie Credits Error:', errorData);
      throw new Error(`Failed to fetch movie credits: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },

  // Search movies
  searchMovies: async (query: string, page: number = 1): Promise<TMDBMovieResponse> => {
    const url = new URL(`${BASE_URL}/search/movie`);
    url.searchParams.append('api_key', API_KEY);
    url.searchParams.append('language', 'en-US');
    url.searchParams.append('query', query);
    url.searchParams.append('page', page.toString());
    
    const response = await fetch(url.toString(), { headers });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Search Error:', errorData);
      throw new Error('Failed to search movies');
    }
    
    return response.json();
  },

  // Get image URL
  getImageUrl: (path: string, size: string = 'w500'): string => {
    return path ? `${IMAGE_BASE_URL}/${size}${path}` : '';
  },

  // Get poster URL
  getPosterUrl: (path: string | null, size: string = 'w500'): string => {
    return path
      ? `${IMAGE_BASE_URL}/${size}${path}`
      : 'https://via.placeholder.com/500x750?text=No+Poster';
  },

  // Get backdrop URL
  getBackdropUrl: (path: string | null, size: string = 'original'): string => {
    return path
      ? `${IMAGE_BASE_URL}/${size}${path}`
      : 'https://via.placeholder.com/1920x1080?text=No+Backdrop';
  },
};

export default api;
