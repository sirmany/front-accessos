"use client";

import type { User } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const LOGIN_PATH = "/";

  // Effect to check initial auth status from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('gestio-agil-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('gestio-agil-user');
      }
    }
    setInitialAuthChecked(true); // Mark that initial check is done
  }, []);

  const isLoadingAuth = !initialAuthChecked;

  // Effect for handling redirections
  useEffect(() => {
    if (isLoadingAuth) {
      return; // Don't redirect until initial auth status is known
    }

    if (!user && pathname !== LOGIN_PATH) {
      router.replace(LOGIN_PATH);
    } else if (user && pathname === LOGIN_PATH) {
      router.replace('/dashboard');
    }
  }, [user, isLoadingAuth, pathname, router, LOGIN_PATH]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('gestio-agil-user', JSON.stringify(userData));
    router.replace('/dashboard'); // Redirect to dashboard after login
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gestio-agil-user');
    router.replace(LOGIN_PATH); // Redirect to login page after logout
  };
  

  // If initial auth status is still being determined, render a consistent loading state.
  // This ensures server-rendered HTML and initial client-rendered HTML match.
  if (isLoadingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Verificant autenticació...</p>
      </div>
    );
  }

  // After initial auth check (isLoadingAuth is false):
  const authContextValue = { user, login, logout };

  // If on the login page and not logged in (after initial check)
  if (pathname === LOGIN_PATH && !user) {
    return (
      <AuthContext.Provider value={authContextValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  // If not logged in and not on the login page (this state should be transient due to redirection)
  if (!user && pathname !== LOGIN_PATH) {
    // Display a message while redirecting.
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Redirigint a l'inici de sessió...</p>
      </div>
    );
  }
  
  // User is authenticated and not on the login page, or other valid states.
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
