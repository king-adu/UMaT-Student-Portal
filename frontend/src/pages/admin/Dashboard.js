import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaUsers, 
  FaGraduationCap, 
  FaNewspaper, 
  FaMoneyBillWave,
  FaSignOutAlt,
  FaBell,
  FaCog,
  FaChartBar,
  FaUserCheck,
  FaBuilding,
  FaCreditCard
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    onlineUsers: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalRegistrations: 0,
    totalNews: 0,
    totalPayments: 0,
    paymentsByDepartment: [],
    usersByDepartment: [],
  });

  const handleLogout = () => {
    logout();
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const DepartmentCard = ({ department, count, total, color }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900">{department}</h4>
          <p className="text-lg font-bold text-gray-900">{count}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
          <FaBuilding className="h-5 w-5 text-white" />
        </div>
      </div>
      {total && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{Math.round((count / total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div
              className={`h-1 rounded-full ${color.replace('bg-', 'bg-').replace('text-white', '')}`}
              style={{ width: `${(count / total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-xl font-semibold text-gray-900">UMaT Admin Portal</h1>
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
                    <FaUsers className="h-4 w-4 text-primary-600" />
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Admin Dashboard Overview
          </h2>
          <p className="text-gray-600">
            Monitor system activity, manage users, and track academic progress.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Online Users"
            value={stats.onlineUsers}
            icon={FaUserCheck}
            color="bg-success-500"
            subtitle="Currently active"
          />
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={FaUsers}
            color="bg-primary-500"
            subtitle="Registered students"
          />
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={FaGraduationCap}
            color="bg-warning-500"
            subtitle="Available courses"
          />
          <StatCard
            title="Total Payments"
            value={`₵${stats.totalPayments?.toLocaleString() || '0'}`}
            icon={FaMoneyBillWave}
            color="bg-success-600"
            subtitle="Total revenue"
          />
        </div>

        {/* Department Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Users by Department */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Students by Department</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.usersByDepartment?.map((dept, index) => (
                  <DepartmentCard
                    key={dept.department}
                    department={dept.department}
                    count={dept.count}
                    total={stats.totalStudents}
                    color={`bg-primary-${500 + (index * 100)}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Payments by Department */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Payments by Department</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.paymentsByDepartment?.map((dept, index) => (
                  <DepartmentCard
                    key={dept.department}
                    department={dept.department}
                    count={`₵${dept.total?.toLocaleString() || '0'}`}
                    color={`bg-success-${500 + (index * 100)}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/admin/users"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full">
                <FaUsers className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View and manage students</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/courses"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-warning-100 rounded-full">
                <FaGraduationCap className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Manage Courses</h3>
                <p className="text-sm text-gray-600">Add and edit courses</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/news"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-full">
                <FaNewspaper className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Post News</h3>
                <p className="text-sm text-gray-600">Create news posts</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/payments"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-full">
                <FaCreditCard className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                <p className="text-sm text-gray-600">View payment records</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <p className="text-gray-600">
                  <span className="font-medium">{stats.onlineUsers}</span> users are currently online
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success-600 rounded-full"></div>
                <p className="text-gray-600">
                  <span className="font-medium">{stats.totalRegistrations}</span> course registrations this semester
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-warning-600 rounded-full"></div>
                <p className="text-gray-600">
                  <span className="font-medium">{stats.totalNews}</span> news posts published
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 