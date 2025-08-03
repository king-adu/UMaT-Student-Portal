const express = require('express');
const { body, query, param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireStudent } = require('../middleware/roleCheck');
const {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getMyPayments,
  getPaymentsByDepartment,
  getPaymentStats,
  getPaymentById
} = require('../controllers/paymentController');

const router = express.Router();

// Validation middleware
const validatePaymentInitialization = [
  body('amount')
    .isFloat({ min: 100 })
    .withMessage('Amount must be at least 100 NGN'),
  body('paymentType')
    .isIn(['tuition', 'accommodation', 'library', 'other'])
    .withMessage('Invalid payment type'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be between 5 and 500 characters'),
  body('currency')
    .optional()
    .isIn(['NGN', 'USD', 'EUR', 'GBP'])
    .withMessage('Invalid currency')
];

const validatePaymentFilters = [
  query('status')
    .optional()
    .isIn(['pending', 'successful', 'failed', 'abandoned'])
    .withMessage('Invalid payment status'),
  query('paymentType')
    .optional()
    .isIn(['tuition', 'accommodation', 'library', 'other'])
    .withMessage('Invalid payment type'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
];

const validateDepartmentFilter = [
  query('department')
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

const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

const validateReference = [
  param('reference')
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage('Invalid reference format')
];

// Payment routes
router.post('/initialize', authenticateToken, requireStudent, validatePaymentInitialization, initializePayment);
router.get('/verify/:reference', validateReference, verifyPayment);
router.post('/webhook', handleWebhook);

// Student payment routes
router.get('/my-payments', authenticateToken, requireStudent, validatePaymentFilters, getMyPayments);

// Admin payment routes
router.get('/by-department', authenticateToken, requireAdmin, validateDepartmentFilter, validatePaymentFilters, getPaymentsByDepartment);
router.get('/stats', authenticateToken, requireAdmin, validatePaymentFilters, getPaymentStats);
router.get('/:id', authenticateToken, validateObjectId, getPaymentById);

module.exports = router; 