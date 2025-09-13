import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { TMDBMovie } from '../config/tmdb';

type WatchlistContextType = {
  watchlist: TMDBMovie[];
  addToWatchlist: (movie: TMDBMovie) => void;
  removeFromWatchlist: (movieId: number) => void;
  isInWatchlist: (movieId: number) => boolean;
  clearWatchlist: () => void;
};

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<TMDBMovie[]>([]);

  // Load watchlist from localStorage on initial render
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
    } else {
      localStorage.removeItem('watchlist');
    }
  }, [watchlist]);

  const addToWatchlist = useCallback((movie: TMDBMovie) => {
    setWatchlist(prev => {
      // Check if movie is already in watchlist
      const exists = prev.some(m => m.id === movie.id);
      if (exists) return prev;
      return [...prev, movie];
    });
  }, []);

  const removeFromWatchlist = useCallback((movieId: number) => {
    setWatchlist(prev => prev.filter(movie => movie.id !== movieId));
  }, []);

  const isInWatchlist = useCallback((movieId: number) => {
    return watchlist.some(movie => movie.id === movieId);
  }, [watchlist]);

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
  }, []);

  return (
    <WatchlistContext.Provider 
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        clearWatchlist
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = (): WatchlistContextType => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

export default WatchlistContext;
