import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaGraduationCap, 
  FaNewspaper, 
  FaUser, 
  FaSignOutAlt,
  FaBell,
  FaCog
} from 'react-icons/fa';

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">U</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">UMaT Student Portal</h1>
                <p className="text-sm text-gray-500">Welcome, {user?.firstName}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <FaBell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <FaCog className="h-5 w-5" />
              </button>
              <div className="relative">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <FaUser className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors"
              >
                <FaSignOutAlt className="h-4 w-4" />
                <span className="hidden md:block text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-gray-600">
            Manage your courses, stay updated with news, and track your academic progress.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full">
                <FaGraduationCap className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Registered Courses</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-full">
                <FaNewspaper className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">News Updates</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-warning-100 rounded-full">
                <FaUser className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Department</p>
                <p className="text-lg font-semibold text-gray-900">{user?.department}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Course Registration Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <FaGraduationCap className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Course Registration</h3>
                  <p className="text-sm text-gray-600">Register for your courses</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Select your semester, program, and level to view available courses and register for them.
              </p>
              <Link
                to="/student/courses"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Register Courses
              </Link>
            </div>
          </div>

          {/* Departmental News Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-success-100 rounded-full">
                  <FaNewspaper className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Departmental News</h3>
                  <p className="text-sm text-gray-600">Stay updated with news</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                View the latest news and announcements from your department and interact with posts.
              </p>
              <Link
                to="/student/news"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-success-600 hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 transition-colors"
              >
                View News
              </Link>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Name</p>
              <p className="text-gray-900">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Department</p>
              <p className="text-gray-900">{user?.department}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Program</p>
              <p className="text-gray-900">{user?.program}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Level</p>
              <p className="text-gray-900">Level {user?.level}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Reference Number</p>
              <p className="text-gray-900">{user?.referenceNumber}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard; 