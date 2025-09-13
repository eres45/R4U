import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useRateMovie } from '../hooks/useMovies';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const SubmitReviewContainer = styled.div`
  padding: 120px 2rem 4rem;
  max-width: 800px;
  margin: 0 auto;
  animation: ${fadeIn} 0.3s ease-out;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #ffffff;
  text-align: center;
`;

const FormContainer = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #e6e6e6;
  font-size: 1.1rem;
`;

const MovieSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #333;
  border-radius: 6px;
  background: #2a2a2a;
  color: #fff;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #e50914;
    box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border: 1px solid #333;
  border-radius: 6px;
  background: #2a2a2a;
  color: #fff;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #e50914;
    box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
  }
`;

const StarRating = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const StarButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  font-size: 2rem;
  color: ${props => props.active ? '#ffd700' : '#555'};
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s, color 0.2s;
  
  &:hover {
    transform: scale(1.1);
    color: #ffd700;
  }
  
  &:focus {
    outline: none;
  }
`;

const SubmitButton = styled.button`
  background: #e50914;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  transition: background-color 0.2s, transform 0.2s;
  
  &:hover {
    background: #f40612;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #555;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 6px;
  font-size: 0.95rem;
`;

const SuccessMessage = styled(ErrorMessage)`
  color: #51cf66;
  background: rgba(81, 207, 102, 0.1);
`;

interface MovieOption {
  id: number;
  title: string;
  release_date: string;
}

const SubmitReview: React.FC = () => {
  const { movieId } = useParams<{ movieId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rateMovie, error } = useRateMovie();
  
  const [selectedMovie, setSelectedMovie] = useState<string>(movieId || '');
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [movies, setMovies] = useState<MovieOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Fetch user's watchlist or recent movies for selection
  useEffect(() => {
    // In a real app, fetch the user's watchlist or recent movies
    const fetchMovies = async () => {
      try {
        // Mock data - replace with actual API call
        const mockMovies: MovieOption[] = [
          { id: 550, title: 'Fight Club', release_date: '1999-10-15' },
          { id: 680, title: 'Pulp Fiction', release_date: '1994-10-14' },
          { id: 155, title: 'The Dark Knight', release_date: '2008-07-16' },
          { id: 24428, title: 'The Avengers', release_date: '2012-05-04' },
          { id: 299536, title: 'Avengers: Infinity War', release_date: '2018-04-25' },
        ];
        setMovies(mockMovies);
      } catch (err) {
        console.error('Error fetching movies:', err);
      }
    };

    fetchMovies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMovie || rating === 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await rateMovie(parseInt(selectedMovie), rating, reviewText);
      setSubmitSuccess(true);
      setRating(0);
      setReviewText('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        if (movieId) {
          // If we came from a movie page, go back
          navigate(-1);
        }
      }, 3000);
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <SubmitReviewContainer>
        <PageTitle>Sign In Required</PageTitle>
        <p>Please sign in to submit a review.</p>
      </SubmitReviewContainer>
    );
  }

  return (
    <SubmitReviewContainer>
      <PageTitle>{movieId ? 'Write a Review' : 'Submit a Review'}</PageTitle>
      <FormContainer>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="movie-select">Select a Movie</Label>
            <MovieSelect 
              id="movie-select"
              value={selectedMovie}
              onChange={(e) => setSelectedMovie(e.target.value)}
              disabled={!!movieId}
              required
            >
              <option value="">-- Select a movie --</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title} ({new Date(movie.release_date).getFullYear()})
                </option>
              ))}
            </MovieSelect>
          </FormGroup>

          <FormGroup>
            <Label>Your Rating</Label>
            <StarRating>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <StarButton
                  key={star}
                  type="button"
                  active={rating >= star}
                  onClick={() => setRating(star)}
                  aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                >
                  {rating >= star ? '★' : '☆'}
                </StarButton>
              ))}
              <span style={{ marginLeft: '1rem', color: '#fff', fontSize: '1.2rem' }}>
                {rating}/10
              </span>
            </StarRating>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="review-text">Your Review (Optional)</Label>
            <TextArea
              id="review-text"
              placeholder="Share your thoughts about the movie..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              maxLength={2000}
            />
            <div style={{ textAlign: 'right', color: '#999', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {reviewText.length}/2000 characters
            </div>
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {submitSuccess && (
            <SuccessMessage>
              Your review has been submitted successfully! Redirecting...
            </SuccessMessage>
          )}

          <SubmitButton 
            type="submit" 
            disabled={!selectedMovie || rating === 0 || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </SubmitButton>
        </form>
      </FormContainer>
    </SubmitReviewContainer>
  );
};

export default SubmitReview;
