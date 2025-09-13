import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useWatchlist } from '../contexts/WatchlistContext';
import { useNavigate, Link } from 'react-router-dom';

// Styled Components
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(229, 9, 20, 0.2);
  border-radius: 50%;
  border-top-color: #e50914;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ProfileContainer = styled.div`
  padding: 120px 2rem 4rem;
  max-width: 1400px;
  margin: 0 auto;
  color: #ffffff;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Avatar = styled.div<{ $imageUrl: string }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-image: url(${props => props.$imageUrl || 'https://i.pravatar.cc/150?img=32'});
  background-size: cover;
  background-position: center;
  border: 3px solid #e50914;
`;

const UserInfo = styled.div`
  h1 {
    font-size: 2.5rem;
    margin: 0 0 0.5rem;
    color: #ffffff;
  }
  
  p {
    margin: 0;
    color: #cccccc;
    font-size: 1.1rem;
  }
`;

const Section = styled.section`
  margin: 3rem 0;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: #e50914;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  color: ${props => props.$active ? '#ffffff' : '#cccccc'};
  font-size: 1.1rem;
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background: #e50914;
    transform: scaleX(${props => props.$active ? 1 : 0});
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    color: #ffffff;
  }
`;

const ReviewsList = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const ReviewCard = styled.div`
  background: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const MovieTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  color: #ffffff;
  
  a {
    color: inherit;
    text-decoration: none;
    
    &:hover {
      color: #e50914;
      text-decoration: underline;
    }
  }
`;

const ReviewDate = styled.span`
  font-size: 0.9rem;
  color: #999999;
`;

const ReviewRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #ffd700;
  margin: 0.5rem 0;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const ReviewContent = styled.p`
  margin: 1rem 0 0;
  color: #e0e0e0;
  line-height: 1.6;
`;

const WatchlistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
`;

const MovieCard = styled.div`
  border-radius: 8px;
  overflow: hidden;
  background: rgba(30, 30, 30, 0.8);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }
`;

const MoviePoster = styled.div<{ $posterUrl: string }>`
  width: 100%;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  aspect-ratio: 2/3;
  background: #1a1a1a;
  background-image: url(${props => props.$posterUrl});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const MovieInfo = styled.div`
  padding: 1rem;
  
  h3 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    a {
      color: #ffffff;
      text-decoration: none;
      
      &:hover {
        color: #e50914;
      }
    }
  }
  
  .release-date {
    font-size: 0.85rem;
    color: #999999;
    margin: 0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  
  h3 {
    color: white;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
  }
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const EmptyStateTitle = styled.h3`
  color: white;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
`;

const EmptyStateText = styled.p`
  color: #999;
  margin-bottom: 1.5rem;
`;

const BrowseButton = styled.button`
  background: #e50914;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f40612;
  }
`;

const MovieLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const RemoveButton = styled.button`
  background: transparent;
  color: #e50914;
  border: 1px solid #e50914;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.75rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  width: 100%;
  opacity: 0.8;

  &:hover {
    background: rgba(229, 9, 20, 0.1);
    opacity: 1;
  }
`;

const mockReviews = [
  {
    id: '1',
    movieId: 550,
    movieTitle: 'Fight Club',
    posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    rating: 4.5,
    content: 'A mind-bending masterpiece that redefined modern cinema. Norton and Pitt deliver career-defining performances.',
    date: '2023-05-15T14:30:00Z',
  },
  {
    id: '2',
    movieId: 680,
    movieTitle: 'Pulp Fiction',
    posterPath: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    rating: 5,
    content: 'Tarantino at his absolute best. The non-linear storytelling, the dialogue, the characters - everything is perfect.',
    date: '2023-04-22T10:15:00Z',
  },
];

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'reviews' | 'watchlist'>('reviews');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRemoveFromWatchlist = (movieId: number) => {
    removeFromWatchlist(movieId);
  };

  const renderWatchlist = () => {
    if (isLoading) {
      return (
        <LoadingContainer>
          <Spinner />
        </LoadingContainer>
      );
    }

    if (watchlist.length === 0) {
      return (
        <EmptyState>
          <EmptyStateIcon>🎬</EmptyStateIcon>
          <EmptyStateTitle>Your watchlist is empty</EmptyStateTitle>
          <EmptyStateText>Start adding movies to your watchlist to see them here</EmptyStateText>
          <BrowseButton onClick={() => navigate('/movies')}>Browse Movies</BrowseButton>
        </EmptyState>
      );
    }

    return (
      <WatchlistGrid>
        {watchlist.map((movie) => (
          <MovieCard key={movie.id}>
            <MovieLink to={`/movie/${movie.id}`}>
              <MoviePoster 
                $posterUrl={
                  movie.poster_path 
                    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                    : 'https://via.placeholder.com/300x450?text=No+Poster'
                }
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.backgroundImage = 'url(https://via.placeholder.com/300x450?text=No+Poster)';
                }}
              />
              <MovieInfo>
                <h3>{movie.title}</h3>
                <p className="release-date">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </p>
              </MovieInfo>
            </MovieLink>
            <RemoveButton onClick={() => handleRemoveFromWatchlist(movie.id)}>
              Remove from Watchlist
            </RemoveButton>
          </MovieCard>
        ))}
      </WatchlistGrid>
    );
  };

  if (!user) {
    return (
      <ProfileContainer>
        <EmptyState>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <h3>Not Signed In</h3>
          <p>Please sign in to view your profile, reviews, and watchlist.</p>
          <button onClick={() => navigate('/login')}>Sign In</button>
        </EmptyState>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <Avatar $imageUrl={user.avatar || ''} />
        <UserInfo>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <button 
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid #e50914',
              color: '#e50914',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              marginTop: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(229, 9, 20, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Sign Out
          </button>
        </UserInfo>
      </ProfileHeader>

      <Tabs>
        <Tab 
          $active={activeTab === 'reviews'}
          onClick={() => setActiveTab('reviews')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"></path>
          </svg>
          My Reviews
        </Tab>
        <Tab 
          $active={activeTab === 'watchlist'}
          onClick={() => setActiveTab('watchlist')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          Watchlist
        </Tab>
      </Tabs>

      {activeTab === 'reviews' ? (
        <Section>
          <SectionTitle>My Reviews</SectionTitle>
          {mockReviews.length > 0 ? (
            <ReviewsList>
              {mockReviews.map((review) => (
                <ReviewCard key={review.id}>
                  <ReviewHeader>
                    <MovieTitle>
                      <Link to={`/movie/${review.movieId}`}>
                        {review.movieTitle}
                      </Link>
                    </MovieTitle>
                    <ReviewDate>{formatDate(review.date)}</ReviewDate>
                  </ReviewHeader>
                  <ReviewRating>
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill={i < Math.floor(review.rating) ? 'currentColor' : 'none'} 
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"></path>
                      </svg>
                    ))}
                    <span style={{ marginLeft: '0.5rem' }}>{review.rating.toFixed(1)}/5</span>
                  </ReviewRating>
                  <ReviewContent>{review.content}</ReviewContent>
                </ReviewCard>
              ))}
            </ReviewsList>
          ) : (
            <EmptyState>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"></path>
              </svg>
              <h3>No Reviews Yet</h3>
              <p>You haven't reviewed any movies yet. Start reviewing your favorite movies!</p>
              <button onClick={() => navigate('/')}>Browse Movies</button>
            </EmptyState>
          )}
        </Section>
      ) : (
        <Section>
          <SectionTitle>My Watchlist</SectionTitle>
          {renderWatchlist()}
        </Section>
      )}
    </ProfileContainer>
  );
};

export default Profile;
