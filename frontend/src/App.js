import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/common/PrivateRoute';
import PublicRoute from './components/common/PublicRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import CourseRegistration from './pages/student/CourseRegistration';
import DepartmentalNews from './pages/student/DepartmentalNews';
import StudentProfile from './pages/student/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminNews from './pages/admin/News';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import AdminPayments from './pages/admin/Payments';

// Common Components
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />

              {/* Student Routes */}
              <Route 
                path="/student" 
                element={
                  <PrivateRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/student/courses" 
                element={
                  <PrivateRoute allowedRoles={['student']}>
                    <CourseRegistration />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/student/news" 
                element={
                  <PrivateRoute allowedRoles={['student']}>
                    <DepartmentalNews />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/student/profile" 
                element={
                  <PrivateRoute allowedRoles={['student']}>
                    <StudentProfile />
                  </PrivateRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/news" 
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminNews />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/courses" 
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminCourses />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/payments" 
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminPayments />
                  </PrivateRoute>
                } 
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>

            {/* Global Components */}
            <LoadingSpinner />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 