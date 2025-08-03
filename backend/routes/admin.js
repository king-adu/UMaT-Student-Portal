const express = require('express');
const { param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const {
  getDashboardStats,
  getOnlineUsers,
  getUsersByDepartment,
  getUserStats,
  getCourseStats,
  getRegistrationStats,
  getNewsStats,
  getPaymentStats,
  getTotalPaymentsByDepartment,
  getSystemHealth
} = require('../controllers/adminController');

const router = express.Router();

// Validation middleware
const validateDepartment = [
  param('department')
    .isIn([
      'Mining Engineering',
      'Geological Engineering',
      'Minerals Engineering',
      'Petroleum Engineering',
      'Mechanical Engineering',
      'Electrical Engineering',
      'Civil Engineering',
      'Computer Science and Engineering',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Environmental and Safety Engineering'
    ])
    .withMessage('Invalid department')
];

// Dashboard routes
router.get('/dashboard', authenticateToken, requireAdmin, getDashboardStats);

// User management routes
router.get('/users/online', authenticateToken, requireAdmin, getOnlineUsers);
router.get('/users/by-department/:department', authenticateToken, requireAdmin, validateDepartment, getUsersByDepartment);
router.get('/users/stats', authenticateToken, requireAdmin, getUserStats);

// Course management routes
router.get('/courses/stats', authenticateToken, requireAdmin, getCourseStats);

// Registration management routes
router.get('/registrations/stats', authenticateToken, requireAdmin, getRegistrationStats);

// News management routes
router.get('/news/stats', authenticateToken, requireAdmin, getNewsStats);

// Payment management routes
router.get('/payments/stats', authenticateToken, requireAdmin, getPaymentStats);
router.get('/payments/total-by-department', authenticateToken, requireAdmin, getTotalPaymentsByDepartment);

// System management routes
router.get('/system/health', authenticateToken, requireAdmin, getSystemHealth);

module.exports = router; 