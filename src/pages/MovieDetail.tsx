import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useMovieDetails, useMovieVideos, useMovieCredits, useRateMovie, useSimilarMovies } from '../hooks/useMovies';
import { Video, Cast, TMDBMovie } from '../config/tmdb';

// Import components
import MovieCard from '../components/MovieCard';
import { useWatchlist } from '../contexts/WatchlistContext';
import { useAuth } from '../contexts/AuthContext';

const MovieDetailContainer = styled.div`
  padding: 100px 2rem 4rem;
  max-width: 1400px;
  margin: 0 auto;
  color: #ffffff;
  position: relative;
`;

const SimilarMoviesContainer = styled.div`
  margin: 4rem 0;
`;

const SimilarMoviesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const ReviewSection = styled.section`
  margin: 4rem 0;
  padding: 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  scroll-margin-top: 100px; /* Account for fixed header */
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #e6e6e6;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;

  &:hover {
    color: #e50914;
  }
`;

const Section = styled.section`
  margin: 3rem 0;
`;


const VideoContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
`;

const VideoItem = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const VideoThumbnail = styled.div<{ $thumbnailUrl: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7)),
    url(${props => props.$thumbnailUrl}) center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    content: '▶';
    font-size: 4rem;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    transition: transform 0.2s ease;
  }
  
  &:hover::after {
    transform: scale(1.1);
  }
`;

const CastGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
`;

const CastCard = styled.div`
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CastImage = styled.div<{ $imageUrl: string }>`
  width: 100%;
  padding-bottom: 150%;
  background: ${props => 
    props.$imageUrl 
      ? `url(${props.$imageUrl}) center/cover no-repeat` 
      : 'linear-gradient(to bottom right, #333, #666)'};
`;

const CastInfo = styled.div`
  padding: 0.8rem;
  
  h4 {
    margin: 0 0 0.3rem;
    font-size: 0.9rem;
    color: #fff;
  }
  
  p {
    margin: 0;
    font-size: 0.8rem;
    color: #aaa;
  }
`;


const MovieHeader = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  position: relative;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  border: ${props => props.$variant === 'secondary' ? '1px solid #666' : 'none'};
  background: ${props => props.$variant === 'secondary' ? 'transparent' : '#e50914'};
  color: ${props => props.$variant === 'secondary' ? '#fff' : '#fff'};
  
  &:hover {
    background: ${props => props.$variant === 'secondary' ? 'rgba(255, 255, 255, 0.1)' : '#f40612'};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Poster = styled.div<{ $posterUrl: string }>`
  width: 300px;
  height: 450px;
  background-image: url(${props => props.$posterUrl});
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 500px;
  }
`;

const MovieInfo = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
  color: #ffffff;
`;

const Meta = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  color: #cccccc;
  font-size: 0.9rem;
`;

const Tagline = styled.p`
  font-style: italic;
  color: #e50914;
  margin-bottom: 1.5rem;
`;

const RatingBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background: rgba(229, 9, 20, 0.1);
  color: #ffd700;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 215, 0, 0.3);
  
  svg {
    margin-right: 0.3rem;
    color: #ffd700;
  }
`;

const OverviewContainer = styled.div`
  margin-bottom: 2rem;
`;

const Overview = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  margin: 1rem 0 0 0;
  color: #e0e0e0;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const DetailItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 8px;
`;

const DetailLabel = styled.div`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #999999;
  margin-bottom: 0.5rem;
`;

const DetailValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin: 3rem 0 1.5rem;
  color: #ffffff;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e50914;
  display: inline-block;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: #e50914;
  }
`;



const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const StarsContainer = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const StarIcon = styled.span<{ $active: boolean }>`
  color: ${props => props.$active ? '#ffc107' : '#666'};
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
`;

const RatingText = styled.span`
  font-size: 1rem;
  color: #ffc107;
  font-weight: 600;
`;

const StyledReviewForm = styled.form`
  background: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  padding: 2rem;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  label {
    font-size: 0.9rem;
    color: #ccc;
    display: block;
    margin-bottom: 0.5rem;
  }

  textarea {
    width: 100%;
    min-height: 100px;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid #444;
    border-radius: 4px;
    color: #fff;
    font-size: 1rem;
    resize: vertical;
  }
`;

const PlayIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.5rem;
  color: white;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  opacity: 0.8;
  transition: all 0.2s;
`;

const VideoTitle = styled.h4`
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  font-weight: 500;
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

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  color: #ffffff;
`;

const Error = styled.div`
  color: #e50914;
  padding: 2rem;
  text-align: center;
`;

interface ReviewFormData {
  content: string;
  rating: number;
}

const MovieDetail: React.FC = () => {
  const reviewSectionRef = useRef<HTMLDivElement>(null);
  const { id: movieId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
  // State hooks
  const [formData, setFormData] = useState<ReviewFormData>({ content: '', rating: 0 });
  const [isInUserWatchlist, setIsInUserWatchlist] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Fetch movie data
  const { movie, loading: movieLoading, error: movieError } = useMovieDetails(movieId ? parseInt(movieId) : 0);
  const { videos, loading: videosLoading, error: videosError } = useMovieVideos(movieId ? parseInt(movieId) : 0);
  const { credits, loading: creditsLoading, error: creditsError } = useMovieCredits(movieId ? parseInt(movieId) : 0);
  const { similar, loading: similarLoading, error: similarError } = useSimilarMovies(movieId ? parseInt(movieId) : 0);
  const { rateMovie } = useRateMovie();
  
  useEffect(() => {
    if (movie) {
      setIsInUserWatchlist(isInWatchlist(movie.id));
    }
  }, [movie, isInWatchlist]);
  
  const handleWatchlistToggle = useCallback(() => {
    if (!movie) return;
    
    const movieData: TMDBMovie = {
      id: movie.id,
      title: movie.title,
      overview: movie.overview || '',
      poster_path: movie.poster_path || '',
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      release_date: movie.release_date,
      genre_ids: movie.genres?.map((g: { id: number }) => g.id) || [],
      backdrop_path: movie.backdrop_path || '',
      original_language: movie.original_language,
      popularity: movie.popularity,
      // Remove unsupported properties
    };
    
    if (isInUserWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movieData);
    }
    setIsInUserWatchlist(!isInUserWatchlist);
  }, [movie, isInUserWatchlist, addToWatchlist, removeFromWatchlist]);

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const scrollToReview = useCallback(() => {
    reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !movieId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await rateMovie(parseInt(movieId), formData.rating, formData.content);
      setFormData({ content: '', rating: 0 });
    } catch (err) {
      console.error('Error submitting review:', err);
      setSubmitError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('MovieDetail render -', { movieId, movie, movieLoading, movieError });

  if (movieLoading) {
    return <Loading>Loading movie details...</Loading>;
  }
  
  if (movieError || !movie) {
    return (
      <Error>
        <h2>Error loading movie details</h2>
        <p>Movie ID: {movieId}</p>
        <p>Error: {movieError || 'Movie not found'}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </Error>
    );
  }
  

  return (
    <MovieDetailContainer>
      <BackButton onClick={() => navigate(-1)}>← Back to Movies</BackButton>
      <MovieHeader>
        <Poster 
          $posterUrl={
            movie.poster_path 
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : 'https://via.placeholder.com/500x750?text=No+Poster'
          } 
        />
        <MovieInfo>
          <Title>{movie.title} <span style={{ opacity: 0.7 }}>({new Date(movie.release_date).getFullYear()})</span></Title>
          <Meta>
            <span>{movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}</span>
            <span>•</span>
            <span>{movie.genres?.map((g: { id: number; name: string }) => g.name).join(', ')}</span>
            <span>•</span>
            <span>{movie.runtime} min</span>
          </Meta>
          <RatingContainer>
            <StarsContainer>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} $active={star <= Math.round(movie.vote_average / 2)}>
                  ★
                </StarIcon>
              ))}
            </StarsContainer>
            <RatingText>{movie.vote_average.toFixed(1)}/10 • {movie.vote_count} votes</RatingText>
          </RatingContainer>
          <ActionButtons>
            {user ? (
              <>
                <Button 
                  onClick={handleWatchlistToggle}
                  $variant={isInUserWatchlist ? 'secondary' : 'primary'}
                >
                  {isInUserWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </Button>
                <Button 
                  onClick={scrollToReview}
                  $variant="primary"
                >
                  Write a Review
                </Button>
              </>
            ) : (
              <Button 
                as={Link} 
                to="/login" 
                state={{ from: window.location.pathname }}
                $variant="primary"
              >
                Sign in to rate or review
              </Button>
            )}
          </ActionButtons>
          {movie.tagline && <Tagline>"{movie.tagline}"</Tagline>}
          <OverviewContainer>
            <RatingBadge>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              {movie.vote_average.toFixed(1)}/10 • {movie.vote_count} votes
            </RatingBadge>
            <Overview>{movie.overview}</Overview>
          </OverviewContainer>
          
          <DetailsGrid>
            <DetailItem>
              <DetailLabel>Status</DetailLabel>
              <DetailValue>{movie.status}</DetailValue>
            </DetailItem>
            
            <DetailItem>
              <DetailLabel>Original Language</DetailLabel>
              <DetailValue>{movie.original_language?.toUpperCase()}</DetailValue>
            </DetailItem>
            
            <DetailItem>
              <DetailLabel>Budget</DetailLabel>
              <DetailValue>${movie.budget?.toLocaleString() || 'N/A'}</DetailValue>
            </DetailItem>
            
            <DetailItem>
              <DetailLabel>Revenue</DetailLabel>
              <DetailValue>${movie.revenue?.toLocaleString() || 'N/A'}</DetailValue>
            </DetailItem>
          </DetailsGrid>
        </MovieInfo>
      </MovieHeader>

      <Section>
        <SectionTitle>Trailers & Videos</SectionTitle>
        {videosLoading ? (
          <Loading>Loading videos...</Loading>
        ) : videosError ? (
          <Error>{videosError}</Error>
        ) : videos && videos.length > 0 ? (
          <VideoContainer>
            {videos
              .filter((video: Video) => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser'))
              .map((video: Video) => (
                <VideoItem key={video.id} onClick={() => setSelectedVideo(video.key)}>
                  <VideoThumbnail $thumbnailUrl={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}>
                    <PlayIcon>▶</PlayIcon>
                  </VideoThumbnail>
                  <VideoTitle>{video.name}</VideoTitle>
                </VideoItem>
              ))}
          </VideoContainer>
        ) : (
          <p>No videos available.</p>
        )}
        {selectedVideo && (
          <VideoModal onClick={() => setSelectedVideo(null)}>
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              title="Movie Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </VideoModal>
        )}
      </Section>

      <Section>
        <SectionTitle>Cast</SectionTitle>
        {creditsLoading ? (
          <Loading>Loading cast...</Loading>
        ) : creditsError ? (
          <Error>{creditsError}</Error>
        ) : credits?.cast && credits.cast.length > 0 ? (
          <CastGrid>
            {credits.cast.slice(0, 12).map((person: Cast) => (
              <CastCard key={person.credit_id}>
                <CastImage 
                  $imageUrl={person.profile_path 
                    ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
                    : ''}
                />
                <CastInfo>
                  <h4>{person.name}</h4>
                  <p>{person.character}</p>
                </CastInfo>
              </CastCard>
            ))}
          </CastGrid>
        ) : (
          <p>No cast information available.</p>
        )}
      </Section>

      <ReviewSection ref={reviewSectionRef}>
        <SectionTitle>Write a Review</SectionTitle>
        {user ? (
          <StyledReviewForm onSubmit={handleSubmit}>
            <div>
              <label>Rating:</label>
              <div>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button 
                    key={star} 
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: star <= formData.rating ? '#e50914' : '#666',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      padding: '0 2px',
                    }}
                  >
                    ★
                  </button>
                ))}
                <span style={{ marginLeft: '10px' }}>{formData.rating}/10</span>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="content">Your Review:</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={5}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  marginTop: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '1rem',
                  resize: 'vertical',
                  minHeight: '100px',
                }}
                placeholder="Share your thoughts about this movie..."
              />
            </div>
            {submitError && (
              <div style={{ color: '#e50914', margin: '0.5rem 0' }}>
                {submitError}
              </div>
            )}
            <Button 
              type="submit" 
              $variant="primary" 
              style={{ marginTop: '1rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </StyledReviewForm>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Please log in to write a review.</p>
            <Link to="/login" style={{ color: '#e50914', textDecoration: 'none' }}>
              <Button $variant="primary" style={{ marginTop: '1rem' }}>
                Log In
              </Button>
            </Link>
          </div>
        )}
      </ReviewSection>

      <SimilarMoviesContainer>
        <SectionTitle>Similar Movies</SectionTitle>
        {similarLoading ? (
          <div>Loading similar movies...</div>
        ) : similarError ? (
          <div>Error loading similar movies: {similarError}</div>
        ) : similar && similar.length > 0 ? (
          <SimilarMoviesGrid>
            {similar.slice(0, 6).map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onClick={() => navigate(`/movie/${movie.id}`)}
              />
            ))}
          </SimilarMoviesGrid>
        ) : (
          <div>No similar movies found.</div>
        )}
      </SimilarMoviesContainer>

    </MovieDetailContainer>
  );
};

export default MovieDetail;
