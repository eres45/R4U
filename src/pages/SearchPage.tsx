import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import MovieGrid from '../components/MovieGrid';
import { TMDBMovie } from '../config/tmdb';
import api from '../config/tmdb';

const SearchContainer = styled.div`
  padding: 2rem 5rem;
  margin-top: 70px; /* Account for fixed header */
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
`;

const SearchHeader = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SearchTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #fff;
  font-weight: 700;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.95rem;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #e50914;
  }
  
  option {
    background: #1a1a1a;
    color: white;
  }
`;

const SearchResults = styled.div`
  margin-top: 2rem;
`;

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    year: '',
    rating: '',
    genre: ''
  });

  const searchQuery = searchParams.get('q') || '';

  // Fetch search results when query or filters change
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Call the search API with query
        const response = await api.searchMovies(searchQuery, 1);
        
        // Apply filters
        let filteredResults = response.results;
        
        if (filters.year) {
          filteredResults = filteredResults.filter(
            (movie: TMDBMovie) => movie.release_date?.startsWith(filters.year)
          );
        }
        
        if (filters.rating) {
          const minRating = parseFloat(filters.rating);
          filteredResults = filteredResults.filter(
            (movie: TMDBMovie) => movie.vote_average >= minRating
          );
        }
        
        setMovies(filteredResults);
      } catch (err) {
        console.error('Error searching movies:', err);
        setError('Failed to load search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <SearchContainer>
      <SearchHeader>
        <SearchTitle>Search Results for "{searchQuery}"</SearchTitle>
        <FiltersContainer>
          <FilterGroup>
            <FilterLabel>Year:</FilterLabel>
            <FilterSelect 
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
            >
              <option value="">All Years</option>
              {Array.from({ length: 30 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - i}>
                  {new Date().getFullYear() - i}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Min Rating:</FilterLabel>
            <FilterSelect 
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
            >
              <option value="">Any Rating</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(rating => (
                <option key={rating} value={rating}>
                  {rating}+ Rating
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Genre:</FilterLabel>
            <FilterSelect 
              name="genre"
              value={filters.genre}
              onChange={handleFilterChange}
            >
              <option value="">All Genres</option>
              {/* Add genre options here */}
            </FilterSelect>
          </FilterGroup>
        </FiltersContainer>
      </SearchHeader>
      
      <SearchResults>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <MovieGrid movies={movies} loading={loading} error={error} emptyMessage="No movies found matching your search." />
        )}
      </SearchResults>
    </SearchContainer>
  );
};

export default SearchPage;
