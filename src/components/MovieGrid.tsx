import React from 'react';
import styled from 'styled-components';
import { TMDBMovie } from '../config/tmdb';
import { Link } from 'react-router-dom';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
`;

const Loading = styled.div`
  padding: 2rem;
  text-align: center;
  color: #999;
`;

const ErrorMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #e50914;
`;

const EmptyMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #999;
`;

const MovieCard = styled(Link)`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  aspect-ratio: 2/3;
  background: #1a1a1a;
  color: white;
  text-decoration: none;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }
`;

const Poster = styled.div<{ $posterUrl: string; alt?: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$posterUrl});
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  }
`;

const MovieTitle = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  color: white;
  font-weight: 600;
  z-index: 2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RatingBadge = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: #ffd700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  z-index: 2;
`;

interface MovieGridProps {
  movies: TMDBMovie[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

const MovieGrid: React.FC<MovieGridProps> = ({ 
  movies, 
  loading = false, 
  error = null,
  emptyMessage = 'No movies found' 
}) => {
  if (loading) {
    return <Loading>Loading movies...</Loading>;
  }

  if (error) {
    return <ErrorMessage>Error: {error}</ErrorMessage>;
  }

  if (!movies || movies.length === 0) {
    return <EmptyMessage>{emptyMessage}</EmptyMessage>;
  }

  return (
    <Grid>
      {movies.map((movie: TMDBMovie) => (
        <MovieCard key={movie.id} to={`/movie/${movie.id}`}>
          <Poster 
            $posterUrl={movie.poster_path 
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
              : 'https://via.placeholder.com/500x750?text=No+Poster'}
          />
          <MovieTitle>{movie.title}</MovieTitle>
          {movie.vote_average > 0 && (
            <RatingBadge>{movie.vote_average.toFixed(1)}</RatingBadge>
          )}
        </MovieCard>
      ))}
    </Grid>
  );
};

export default MovieGrid;
