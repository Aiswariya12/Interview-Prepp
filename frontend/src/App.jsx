import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { queryClient } from './queryClient';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import MockTestConfig from './pages/student/MockTestConfig';
import MockTestExecution from './pages/student/MockTestExecution';
import MockTestResult from './pages/student/MockTestResult';
import TestHistory from './pages/student/TestHistory';
import BookmarksPage from './pages/student/BookmarksPage';
import DailyChallengePage from './pages/student/DailyChallengePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AIChatBot from './components/AIChatBot';

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  // Hide Navbar and Footer during active live mock test session for distraction-free focus
  const isLiveSession = location.pathname.startsWith('/mock/session/');

  return (
    <div className="flex flex-col min-h-screen">
      {!isLiveSession && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isLiveSession && <Footer />}
      <AIChatBot />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <LayoutWrapper>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mock/new"
                element={
                  <ProtectedRoute>
                    <MockTestConfig />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mock/session/:id"
                element={
                  <ProtectedRoute>
                    <MockTestExecution />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mock/results/:id"
                element={
                  <ProtectedRoute>
                    <MockTestResult />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <TestHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookmarks"
                element={
                  <ProtectedRoute>
                    <BookmarksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/daily-challenge"
                element={
                  <ProtectedRoute>
                    <DailyChallengePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="ROLE_ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </LayoutWrapper>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
