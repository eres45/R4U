import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

// Using text-based search icon to avoid type issues
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 10, 10, 0.98);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.9rem 0;
  height: 70px;
  display: flex;
  align-items: center;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 2000px;
  margin: 0 auto;
  padding: 0 5rem;
  height: 100%;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  height: 100%;
  padding: 0 1.5rem 0 0;
  
  &::before {
    content: '🎬';
    margin-right: 0.8rem;
    font-size: 1.8rem;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 600px;
  margin: 0 2rem;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 3rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);

  &:focus {
    background: rgba(255, 255, 255, 0.15);
    border-color: #e50914;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  height: 100%;
  padding: 0 0 0 1.5rem;
`;

const AuthButton = styled.button`
  background: transparent;
  border: 1px solid #e50914;
  color: #e50914;
  padding: 0.4rem 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: #e50914;
    color: #ffffff;
  }
`;

const UserProfile = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  text-decoration: none;
  color: white;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e50914;
  }
`;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <HeaderContainer>
      <Nav>
        <Logo to="/">R4U – Reviews For You</Logo>
        
        <SearchContainer>
          <form onSubmit={handleSearch}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <SearchInput
              type="text"
              placeholder="Search for movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </form>
        </SearchContainer>
        
        <UserSection>
          {user ? (
            <>
              <UserProfile to="/profile">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e50914&color=fff`} 
                  alt={user.name} 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e50914&color=fff`;
                  }}
                />
                <span>{user.name}</span>
              </UserProfile>
              <AuthButton onClick={handleLogout}>Logout</AuthButton>
            </>
          ) : (
            <>
              <AuthButton onClick={() => navigate('/login')}>Login</AuthButton>
              <AuthButton onClick={() => navigate('/register')} style={{ background: '#e50914', color: 'white' }}>
                Sign Up
              </AuthButton>
            </>
          )}
        </UserSection>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
