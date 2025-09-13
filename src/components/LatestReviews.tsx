import React from 'react';
import styled from 'styled-components';

const ReviewsContainer = styled.section`
  padding: 4rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.3);
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ReviewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ReviewCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(229, 9, 20, 0.3);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e50914, #f40612);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.2rem;
`;

const ReviewDate = styled.span`
  font-size: 0.8rem;
  color: #aaaaaa;
`;

const StarRating = styled.div`
  display: flex;
  gap: 0.2rem;
  margin-bottom: 1rem;
`;

const Star = styled.span<{ $filled: boolean }>`
  color: ${props => props.$filled ? '#ffd700' : '#333'};
  font-size: 1rem;
`;

const ReviewText = styled.p`
  font-size: 0.9rem;
  line-height: 1.6;
  color: #cccccc;
  margin-bottom: 1rem;
`;

const MovieTitle = styled.h5`
  font-size: 0.8rem;
  color: #e50914;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const reviews = [
  {
    id: 1,
    userName: "Alex Chen",
    userInitial: "A",
    date: "2 days ago",
    rating: 4,
    movieTitle: "X-Men: Apocalypse",
    text: "Visually stunning with great action sequences. The character development could have been better, but overall an entertaining watch."
  },
  {
    id: 2,
    userName: "Sarah Johnson",
    userInitial: "S",
    date: "1 week ago",
    rating: 5,
    movieTitle: "Jason Bourne",
    text: "Matt Damon delivers another stellar performance. The action is intense and the plot keeps you on the edge of your seat throughout."
  },
  {
    id: 3,
    userName: "Mike Rodriguez",
    userInitial: "M",
    date: "3 days ago",
    rating: 3,
    movieTitle: "Suicide Squad",
    text: "Mixed feelings about this one. Great cast and some fun moments, but the story felt disjointed. Worth watching for the characters."
  },
  {
    id: 4,
    userName: "Emma Wilson",
    userInitial: "E",
    date: "5 days ago",
    rating: 4,
    movieTitle: "Star Trek Beyond",
    text: "A solid addition to the franchise. Great special effects and the crew chemistry is as strong as ever. Fans will love it."
  },
  {
    id: 5,
    userName: "David Kim",
    userInitial: "D",
    date: "1 week ago",
    rating: 5,
    movieTitle: "Ghostbusters",
    text: "Hilarious and well-executed reboot. The cast has great chemistry and the special effects are top-notch. Highly recommended!"
  }
];

const LatestReviews: React.FC = () => {
  return (
    <ReviewsContainer>
      <SectionTitle>Latest Reviews</SectionTitle>
      <ReviewsGrid>
        {reviews.map((review) => (
          <ReviewCard key={review.id}>
            <ReviewHeader>
              <UserAvatar>{review.userInitial}</UserAvatar>
              <UserInfo>
                <UserName>{review.userName}</UserName>
                <ReviewDate>{review.date}</ReviewDate>
              </UserInfo>
            </ReviewHeader>
            <StarRating>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} $filled={star <= review.rating}>★</Star>
              ))}
            </StarRating>
            <ReviewText>{review.text}</ReviewText>
            <MovieTitle>{review.movieTitle}</MovieTitle>
          </ReviewCard>
        ))}
      </ReviewsGrid>
    </ReviewsContainer>
  );
};

export default LatestReviews;
