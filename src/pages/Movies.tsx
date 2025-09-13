import React, { useState } from 'react';
import styled from 'styled-components';
import { usePopularMovies } from '../hooks/useMovies';
import MovieGrid from '../components/MovieGrid';

const MoviesContainer = styled.div`
  padding: 120px 2rem 4rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1.25rem;
  border: 1px solid ${props => props.$active ? '#e50914' : 'rgba(255, 255, 255, 0.1)'};
  background: ${props => props.$active ? 'rgba(229, 9, 20, 0.1)' : 'transparent'};
  color: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'};
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 3rem;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.$active ? '#e50914' : 'rgba(255, 255, 255, 0.1)'};
  background: ${props => props.$active ? 'rgba(229, 9, 20, 0.1)' : 'transparent'};
  color: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Movies: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'popular' | 'top_rated' | 'upcoming' | 'now_playing'>('popular');
  const { movies, loading, error, totalPages } = usePopularMovies(currentPage, filter);

  const handleFilterChange = (newFilter: 'popular' | 'top_rated' | 'upcoming' | 'now_playing') => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageButtons = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // First page
    if (startPage > 1) {
      pageButtons.push(
        <PageButton key="first" onClick={() => setCurrentPage(1)}>
          «
        </PageButton>
      );
    }

    // Previous page
    pageButtons.push(
      <PageButton 
        key="prev" 
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
      >
        ‹
      </PageButton>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <PageButton
          key={i}
          $active={i === currentPage}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </PageButton>
      );
    }

    // Next page
    pageButtons.push(
      <PageButton
        key="next"
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
      >
        ›
      </PageButton>
    );

    // Last page
    if (endPage < totalPages) {
      pageButtons.push(
        <PageButton key="last" onClick={() => setCurrentPage(totalPages)}>
          »
        </PageButton>
      );
    }

    return pageButtons;
  };

  return (
    <MoviesContainer>
      <Header>
        <Title>Movies</Title>
      </Header>

      <Filters>
        <FilterButton 
          $active={filter === 'popular'}
          onClick={() => handleFilterChange('popular')}
        >
          Popular
        </FilterButton>
        <FilterButton 
          $active={filter === 'top_rated'}
          onClick={() => handleFilterChange('top_rated')}
        >
          Top Rated
        </FilterButton>
        <FilterButton 
          $active={filter === 'upcoming'}
          onClick={() => handleFilterChange('upcoming')}
        >
          Upcoming
        </FilterButton>
        <FilterButton 
          $active={filter === 'now_playing'}
          onClick={() => handleFilterChange('now_playing')}
        >
          Now Playing
        </FilterButton>
      </Filters>

      <MovieGrid 
        movies={movies} 
        loading={loading} 
        error={error}
        emptyMessage="No movies found."
      />

      {totalPages > 1 && (
        <Pagination>
          {renderPagination()}
        </Pagination>
      )}
    </MoviesContainer>
  );
};

export default Movies;
