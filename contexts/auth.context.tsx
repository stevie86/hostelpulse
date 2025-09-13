import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: { message: string } }>;
  signUp: (email: string, password: string) => Promise<{ error?: { message: string } }>;
  resetPassword: (email: string) => Promise<{ error?: { message: string } }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    // Mock login - in a real app, this would call an API
    return new Promise<{ error?: { message: string } }>((resolve) => {
      setTimeout(() => {
        setUser({
          id: '1',
          email,
          name: 'Mock User',
        });
        setIsLoading(false);
        resolve({}); // Success, no error
      }, 1000);
    });
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    // Mock register - in a real app, this would call an API and send a verification email
    return new Promise<{ error?: { message: string } }>((resolve) => {
      setTimeout(() => {
        setUser({
          id: '1',
          email,
          name: 'New User',
        });
        setIsLoading(false);
        resolve({}); // Success, no error
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    resetPassword: async (email: string) => {
      setIsLoading(true);
      return new Promise<{ error?: { message: string } }>((resolve) => {
        setTimeout(() => {
          // Simulate success
          setIsLoading(false);
          resolve({});
        }, 500);
      });
    },
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
