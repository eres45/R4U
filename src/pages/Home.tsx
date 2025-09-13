import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePopularMovies } from '../hooks/useMovies';
import Carousel from '../components/Carousel';
import MovieGrid from '../components/MovieGrid';
import api, { TMDBMovie } from '../config/tmdb';

// Styled components
const HomeContainer = styled.div`
  padding-top: 80px;
  min-height: 100vh;
  background: #141414;
  color: white;
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
  color: white;
`;

const Error = styled.div`
  color: #e50914;
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
`;


const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: white;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 4px;
    background: #e50914;
    border-radius: 2px;
  }
`;

// Type for filtered movie with required properties
interface FilteredMovie extends TMDBMovie {
  backdrop_path: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

const Home: React.FC = () => {
  const [nowPlayingMovies, setNowPlayingMovies] = useState<FilteredMovie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get popular movies
  const { movies: popularMovies, loading: popularLoading } = 
    usePopularMovies(1, 'popular');
  
  // Get now playing movies for the carousel
  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        setLoading(true);
        const response = await api.getNowPlayingMovies(1);
        // Ensure we only include movies with both poster and backdrop paths
        const movies = response.results.filter(
          (movie: TMDBMovie): movie is FilteredMovie => 
            !!movie.poster_path && 
            !!movie.backdrop_path &&
            !!movie.release_date &&
            movie.vote_average !== undefined
        );
        setNowPlayingMovies(movies);
        setError(null);
      } catch (err) {
        setError('Failed to fetch movies. Please try again later.');
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNowPlaying();
  }, []);
  
  if (loading) {
    return <Loading>Loading...</Loading>;
  }
  
  if (error) {
    return <Error>Error: {error}</Error>;
  }
  
  return (
    <HomeContainer>
      {/* Carousel Section */}
      {nowPlayingMovies.length > 0 && (
        <Section>
          <Carousel 
            movies={nowPlayingMovies.slice(0, 5)}
            autoPlay={true}
            interval={5000}
          />
        </Section>
      )}

      <div className="container">
        {/* Now Playing Section */}
        <Section>
          <SectionTitle>Now in Theaters</SectionTitle>
          <MovieGrid 
            movies={nowPlayingMovies} 
            loading={loading}
          />
        </Section>

        {/* Popular Movies Section with Filters */}
        <Section>
          <SectionTitle>Popular Movies</SectionTitle>
          <MovieGrid 
            movies={popularMovies} 
            loading={popularLoading}
          />
        </Section>
      </div>
    </HomeContainer>
  );
};

export default Home;
