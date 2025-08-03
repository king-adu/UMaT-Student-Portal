const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
  registerStudent,
  login,
  logout,
  getCurrentUser,
  changePassword
} = require('../controllers/authController');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phoneNumber')
    .matches(/^(\+233|0)[0-9]{9}$/)
    .withMessage('Please enter a valid Ghanaian phone number'),
  body('referenceNumber')
    .isLength({ min: 8 })
    .withMessage('Reference number must be at least 8 characters')
    .matches(/^[0-9]+$/)
    .withMessage('Reference number must contain only numbers'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('department')
    .isIn([
      'Mining Engineering',
      'Minerals Engineering',
      'Geological Engineering',
      'Petroleum Engineering',
      'Mechanical Engineering',
      'Electrical Engineering',
      'Computer Science and Engineering',
      'Environmental and Safety Engineering',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Liberal Studies'
    ])
    .withMessage('Please select a valid department'),
  body('program')
    .isIn([
      'BSc Mining Engineering',
      'BSc Minerals Engineering',
      'BSc Geological Engineering',
      'BSc Petroleum Engineering',
      'BSc Mechanical Engineering',
      'BSc Electrical Engineering',
      'BSc Computer Science and Engineering',
      'BSc Environmental and Safety Engineering',
      'BSc Mathematics',
      'BSc Physics',
      'BSc Chemistry',
      'BSc Liberal Studies'
    ])
    .withMessage('Please select a valid program'),
  body('level')
    .isInt({ min: 100, max: 500 })
    .withMessage('Level must be between 100 and 500')
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Routes
/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new student
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *               - referenceNumber
 *               - password
 *               - department
 *               - program
 *               - level
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               referenceNumber:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               department:
 *                 type: string
 *               program:
 *                 type: string
 *               level:
 *                 type: number
 *     responses:
 *       201:
 *         description: Student registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/register', validateRegistration, registerStudent);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 */
router.post('/login', validateLogin, login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authenticateToken, logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticateToken, getCurrentUser);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password
 */
router.put('/change-password', authenticateToken, validateChangePassword, changePassword);

module.exports = router; 