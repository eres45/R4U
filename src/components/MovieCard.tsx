import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { TMDBMovie } from '../config/tmdb';

const Card = styled.div`
  background: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }
`;

const Poster = styled.div<{ $posterUrl: string }>`
  width: 100%;
  padding-top: 150%;
  background-image: url(${props => props.$posterUrl});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const Info = styled.div`
  padding: 1rem;
`;

const Title = styled.h3`
  font-size: 1rem;
  margin: 0 0 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #999;
`;

const Rating = styled.span`
  display: flex;
  align-items: center;
  color: #ffc107;
  font-weight: 600;
  
  &::before {
    content: '★';
    margin-right: 4px;
  }
`;

interface MovieCardProps {
  movie: TMDBMovie;
  onClick?: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <Card onClick={onClick}>
      <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Poster $posterUrl={posterUrl} />
        <Info>
          <Title>{movie.title}</Title>
          <Meta>
            {movie.release_date && new Date(movie.release_date).getFullYear()}
            {movie.vote_average > 0 && (
              <Rating>{movie.vote_average.toFixed(1)}</Rating>
            )}
          </Meta>
        </Info>
      </Link>
    </Card>
  );
};

export default MovieCard;
