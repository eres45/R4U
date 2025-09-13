import React from 'react';
import styled from 'styled-components';

// Generate year options (last 30 years)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

// Rating options
const ratings = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Styled components

const FiltersContainer = styled.div`
  background: #1a1a1a;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const FilterGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 0.8rem 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  background: #2a2a2a;
  color: white;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #e50914;
    box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.3);
  }
`;

const Select = styled.select`
  padding: 0.8rem 1rem;
  min-width: 120px;
  border: 1px solid #333;
  border-radius: 4px;
  background: #2a2a2a;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.7em top 50%;
  background-size: 1.5em auto;
  
  &:focus {
    outline: none;
    border-color: #e50914;
    box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.3);
  }
  
  option {
    background: #2a2a2a;
    color: white;
  }
`;

const ResetButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: transparent;
  color: #e50914;
  border: 1px solid #e50914;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;
  
  &:hover {
    background: rgba(229, 9, 20, 0.1);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

interface MovieFiltersProps {
  searchTerm: string;
  selectedYear: string;
  selectedRating: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onRatingChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onResetFilters: () => void;
  resultCount?: number;
}

const MovieFilters: React.FC<MovieFiltersProps> = ({
  searchTerm,
  selectedYear,
  selectedRating,
  onSearchChange,
  onYearChange,
  onRatingChange,
  onResetFilters,
  resultCount
}) => {
  return (
    <FiltersContainer>
      <FilterGroup>
        <SearchInput
          type="text"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={onSearchChange}
          aria-label="Search movies"
        />
      </FilterGroup>
      
      <FilterGroup>
        <Select 
          value={selectedYear} 
          onChange={onYearChange}
          aria-label="Filter by year"
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>
        
        <Select 
          value={selectedRating} 
          onChange={onRatingChange}
          aria-label="Filter by minimum rating"
        >
          <option value="">All Ratings</option>
          {ratings.map((rating) => (
            <option key={rating} value={rating}>
              {rating}+ Rating
            </option>
          ))}
        </Select>
        
        {(searchTerm || selectedYear || selectedRating) && (
          <ResetButton 
            onClick={onResetFilters}
            aria-label="Reset all filters"
          >
            Reset Filters
          </ResetButton>
        )}
      </FilterGroup>
      {resultCount !== undefined && (
        <div style={{ color: '#999', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          {resultCount} {resultCount === 1 ? 'movie' : 'movies'} found
        </div>
      )}
    </FiltersContainer>
  );
};

export default MovieFilters;
