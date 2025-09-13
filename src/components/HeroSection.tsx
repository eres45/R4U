import React from 'react';
import styled from 'styled-components';

const HeroContainer = styled.section`
  position: relative;
  height: 100vh;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.8) 100%
  ),
  url('https://images.unsplash.com/photo-1489599162163-3c4b7c8c4d3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 2rem;
`;

const HeroContent = styled.div`
  max-width: 600px;
  z-index: 2;
  margin-left: 4rem;
`;

const MovieTitle = styled.h1`
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const MovieSubtitle = styled.p`
  font-size: 1.2rem;
  color: #cccccc;
  margin-bottom: 2rem;
  line-height: 1.5;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
`;

const WatchTrailerButton = styled.button`
  background: #e50914;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: #f40612;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(229, 9, 20, 0.4);
  }
  
  &::before {
    content: '▶';
    font-size: 0.8rem;
  }
`;

const MovieInfo = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  color: #aaaaaa;
`;

const InfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '•';
    color: #e50914;
    font-weight: bold;
  }
  
  &:first-child::before {
    display: none;
  }
`;

const HeroSection: React.FC = () => {
  return (
    <HeroContainer>
      <HeroContent>
        <MovieTitle>X-MEN: APOCALYPSE</MovieTitle>
        <MovieInfo>
          <InfoItem>2016</InfoItem>
          <InfoItem>Action, Adventure, Sci-Fi</InfoItem>
          <InfoItem>144 min</InfoItem>
          <InfoItem>⭐ 6.9/10</InfoItem>
        </MovieInfo>
        <MovieSubtitle>
          Since the dawn of civilization, he was worshipped as a god. Apocalypse, 
          the first and most powerful mutant from Marvel's X-Men universe, 
          amassed the powers of many other mutants, becoming immortal and invincible.
        </MovieSubtitle>
        <WatchTrailerButton>
          Watch Trailer
        </WatchTrailerButton>
      </HeroContent>
    </HeroContainer>
  );
};

export default HeroSection;
