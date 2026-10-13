import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { queryClient } from '../queryClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('interviewprep_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('interviewprep_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If token exists, optionally verify with /api/auth/me
    if (token && !user) {
      authApi.getCurrentUser()
        .then((res) => {
          if (res.data && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('interviewprep_user', JSON.stringify(res.data.data));
          }
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const data = response.data.data;
      const authToken = data.token;
      const userInfo = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        college: data.college,
      };

      setToken(authToken);
      setUser(userInfo);
      localStorage.setItem('interviewprep_token', authToken);
      localStorage.setItem('interviewprep_user', JSON.stringify(userInfo));
      queryClient.clear();
      return { success: true, user: userInfo };
    } catch (err) {
      let msg = err.response?.data?.message;
      if (!msg) {
        if (err.message && (err.message.includes('Network') || err.code === 'ERR_NETWORK')) {
          msg = 'Cannot connect to backend server. Make sure the Spring Boot backend is running on port 8082.';
        } else {
          msg = 'Invalid email or password. Please try again.';
        }
      }
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authApi.register(userData);
      setUser(null);
      setToken(null);
      localStorage.removeItem('interviewprep_token');
      localStorage.removeItem('interviewprep_user');
      const msg = response.data?.message || 'Registration successful! Please login to continue.';
      return { success: true, message: msg };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    setLoading(true);
    try {
      const response = await authApi.changePassword(passwordData);
      return { success: true, message: response.data?.message || 'Password changed successfully' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password. Please check your credentials.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('interviewprep_token');
    localStorage.removeItem('interviewprep_user');
    queryClient.clear();
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isStudent = user?.role === 'ROLE_STUDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        changePassword,
        logout,
        isAuthenticated,
        isAdmin,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
