import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // In a real app, you would make an API call to your backend
      // This is just a mock implementation
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockUser = {
            id: '1',
            name: 'John Doe',
            email: email,
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
          };
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          setLoading(false);
          resolve(true);
        }, 1000);
      });
    } catch (error) {
      setLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an actual API call to your backend
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        avatar: `https://i.pravatar.cc/150?u=${email}`
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setLoading(true);
    setUser(null);
    localStorage.removeItem('user');
    setLoading(false);
    navigate('/');
  };

  const contextValue = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: user !== null
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
