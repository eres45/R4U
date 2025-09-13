import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { TMDBMovie } from '../config/tmdb';
import { useMovieVideos } from '../hooks/useMovies';

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 70vh;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

interface SlideProps {
  $bgImage: string;
  $isActive: boolean;
}

const Slide = styled.div<SlideProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6)),
    url(${props => props.$bgImage}) center/cover no-repeat;
  opacity: ${props => (props.$isActive ? 1 : 0)};
  transition: opacity 0.8s ease-in-out;
  display: flex;
  align-items: center;
  padding: 0 4rem;
`;

interface SlideContentProps {
  $isActive: boolean;
}

const SlideContent = styled.div<SlideContentProps>`
  max-width: 600px;
  color: white;
  transform: ${props => (props.$isActive ? 'translateX(0)' : 'translateX(-50px)')};
  opacity: ${props => (props.$isActive ? 1 : 0)};
  transition: all 0.5s ease-in-out ${props => (props.$isActive ? '0.3s' : '0s')};
`;

const Title = styled.h2`
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const Overview = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Button = styled.button`
  padding: 0.8rem 2rem;
  margin-right: 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const PrimaryButton = styled(Button)`
  background: #e50914;
  color: white;
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(5px);
`;

const VideoModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
  
  iframe {
    width: 80%;
    height: 80%;
    border: none;
    border-radius: 8px;
    
    @media (max-width: 768px) {
      width: 95%;
      height: 60%;
    }
  }
`;

const Dots = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
`;

interface DotProps {
  $isActive: boolean;
}

const Dot = styled.button<DotProps>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: ${props => (props.$isActive ? '#e50914' : 'rgba(255, 255, 255, 0.5)')};
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  
  &:hover {
    transform: scale(1.2);
  }
`;

interface CarouselProps {
  movies: Array<TMDBMovie & { backdrop_path: string }>;
  autoPlay?: boolean;
  interval?: number;
}

const Carousel: React.FC<CarouselProps> = ({ 
  movies, 
  autoPlay = true, 
  interval = 5000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const currentMovie = movies[currentIndex];
  const { videos } = useMovieVideos(currentMovie?.id || 0);

  useEffect(() => {
    if (!autoPlay || !movies.length) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % movies.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [movies.length, autoPlay, interval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handlePlayNow = () => {
    if (videos && videos.length > 0) {
      // Find the main trailer or first available video
      const trailer = videos.find(video => 
        video.site === 'YouTube' && 
        (video.type === 'Trailer' || video.type === 'Teaser')
      );
      if (trailer) {
        setSelectedVideo(trailer.key);
      }
    }
  };

  const handleMoreInfo = () => {
    if (currentMovie) {
      navigate(`/movie/${currentMovie.id}`);
    }
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  if (!movies.length) return null;

  return (
    <CarouselContainer>
      {movies.map((movie, index) => (
        <Slide 
          key={movie.id} 
          $bgImage={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          $isActive={currentIndex === index}
        >
          <SlideContent $isActive={currentIndex === index}>
            <Title>{movie.title}</Title>
            <Overview>{movie.overview}</Overview>
            <div>
              <PrimaryButton onClick={handlePlayNow}>▶ Play Now</PrimaryButton>
              <SecondaryButton onClick={handleMoreInfo}>ⓘ More Info</SecondaryButton>
            </div>
          </SlideContent>
        </Slide>
      ))}
      
      <Dots>
        {movies.map((_, index) => (
          <Dot 
            key={index} 
            $isActive={currentIndex === index}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </Dots>
      
      {selectedVideo && (
        <VideoModal onClick={closeVideo}>
          <iframe
            src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
            title="Movie Trailer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </VideoModal>
      )}
    </CarouselContainer>
  );
};

export default Carousel;
