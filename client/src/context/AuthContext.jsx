import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('netflix_token');
      if (storedToken) {
        try {
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(storedToken);
          } else {
            localStorage.removeItem('netflix_token');
          }
        } catch (error) {
          console.error("Auth check failed", error);
          localStorage.removeItem('netflix_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const parseResponse = async (response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { error: text || 'Server error. Please make sure the backend is running.' };
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Signup failed');
      return { success: true, needsVerification: data.needsVerification };
    } catch (error) {
      if (error.message === 'Failed to fetch') return { success: false, error: 'Cannot connect to server. Make sure the backend is running.' };
      return { success: false, error: error.message };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Verification failed');
      
      localStorage.setItem('netflix_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      if (error.message === 'Failed to fetch') return { success: false, error: 'Cannot connect to server.' };
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await parseResponse(response);
      if (!response.ok) {
        if (data.needsVerification) return { success: false, needsVerification: true, error: data.error };
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('netflix_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      if (error.message === 'Failed to fetch') return { success: false, error: 'Cannot connect to server. Make sure the backend is running.' };
      return { success: false, error: error.message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await parseResponse(response);
      return { success: response.ok, message: data.message || data.error };
    } catch (error) {
      return { success: false, error: "Cannot connect to server." };
    }
  };

  const resetPassword = async (tokenParam, newPassword) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenParam, newPassword })
      });
      const data = await parseResponse(response);
      return { success: response.ok, message: data.message || data.error };
    } catch (error) {
      return { success: false, error: "Cannot connect to server." };
    }
  };

  const logout = () => {
    localStorage.removeItem('netflix_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    signup,
    verifyOtp,
    login,
    forgotPassword,
    resetPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
