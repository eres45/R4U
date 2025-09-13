import React from 'react';
import styled from 'styled-components';

const UpcomingContainer = styled.section`
  padding: 4rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const MoviesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
`;

const MovieCard = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  }
`;

const MoviePoster = styled.div<{ $bgImage: string }>`
  width: 100%;
  height: 300px;
  background-image: url(${props => props.$bgImage});
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  }
`;

const MovieInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  z-index: 2;
`;

const MovieTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
`;

const MovieGenre = styled.p`
  font-size: 0.8rem;
  color: #cccccc;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
`;

const movies = [
  {
    id: 1,
    title: "JASON BOURNE",
    genre: "Action, Thriller",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 2,
    title: "STAR TREK BEYOND",
    genre: "Action, Adventure, Sci-Fi",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 3,
    title: "SUICIDE SQUAD",
    genre: "Action, Adventure, Fantasy",
    poster: "https://images.unsplash.com/photo-1489599162163-3c4b7c8c4d3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 4,
    title: "GHOSTBUSTERS",
    genre: "Action, Comedy, Fantasy",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 5,
    title: "BAD MOMS",
    genre: "Comedy",
    poster: "https://images.unsplash.com/photo-1489599162163-3c4b7c8c4d3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 6,
    title: "NERVE",
    genre: "Action, Crime, Drama",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  }
];

const UpcomingMovies: React.FC = () => {
  return (
    <UpcomingContainer>
      <SectionTitle>Upcoming</SectionTitle>
      <MoviesGrid>
        {movies.map((movie) => (
          <MovieCard key={movie.id}>
            <MoviePoster $bgImage={movie.poster}>
              <MovieInfo>
                <MovieTitle>{movie.title}</MovieTitle>
                <MovieGenre>{movie.genre}</MovieGenre>
              </MovieInfo>
            </MoviePoster>
          </MovieCard>
        ))}
      </MoviesGrid>
    </UpcomingContainer>
  );
};

export default UpcomingMovies;
