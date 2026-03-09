// reactapp/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { apiService } from '../api'; // <--- CORRECTED IMPORT (path from /context/ to /src/api.js is '../api')

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loadingAuth, setLoadingAuth] = useState(true);

  const fetchUserDetails = useCallback(async () => {
    if (localStorage.getItem('authToken')) {
      try {
        const userData = await apiService.getUser(); // <--- CORRECTED CALL
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const currentToken = localStorage.getItem('authToken');
      if (currentToken) {
        setToken(currentToken);
        await fetchUserDetails();
      }
      setLoadingAuth(false);
    };
    initializeAuth();
  }, [fetchUserDetails]);

  const login = async (email, password) => {
    try {
      const loginData = await apiService.login(email, password); // <--- CORRECTED CALL
      if (loginData && loginData.token) {
          setToken(loginData.token);
          await fetchUserDetails();
          return true;
      } else {
          console.error('Login successful but no token received or loginData undefined.');
          logout();
          return false;
      }
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      logout();
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      await apiService.register(username, email, password); // <--- CORRECTED CALL
      const loginSuccess = await login(email, password);
      if (!loginSuccess) {
        console.warn('Registration successful, but automatic login failed. Please login manually.');
        return { success: true, autoLoginFailed: true };
      }
      return { success: true, autoLoginFailed: false };
    } catch (error) {
      console.error('Registration failed on client:', error);
      if (error.response) {
        console.error('Backend error response:', error.response.data);
      }
      return { success: false, autoLoginFailed: false };
    }
  };

  const logout = () => { // This logout is in AuthContext
    apiService.logout(); // Call the logout from apiService which clears localStorage
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    login,
    logout,
    register,
    isAuthenticated: !!token,
    loadingAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};