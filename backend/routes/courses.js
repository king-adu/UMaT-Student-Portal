const express = require('express');
const { body, query, param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireStudent } = require('../middleware/roleCheck');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  registerForCourse,
  getMyRegistrations,
  approveRegistration,
  rejectRegistration,
  getAllRegistrations,
  getRegistrationStats
} = require('../controllers/courseController');

const router = express.Router();

// Validation middleware
const validateCourseCreation = [
  body('courseCode')
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage('Course code must be between 3 and 10 characters'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('credits')
    .isInt({ min: 1, max: 6 })
    .withMessage('Credits must be between 1 and 6'),
  body('department')
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
    .withMessage('Invalid department'),
  body('program')
    .isIn([
      'BSc Mining Engineering',
      'BSc Geological Engineering',
      'BSc Minerals Engineering',
      'BSc Petroleum Engineering',
      'BSc Mechanical Engineering',
      'BSc Electrical Engineering',
      'BSc Civil Engineering',
      'BSc Computer Science and Engineering',
      'BSc Mathematics',
      'BSc Physics',
      'BSc Chemistry',
      'BSc Environmental and Safety Engineering'
    ])
    .withMessage('Invalid program'),
  body('level')
    .isInt({ min: 100, max: 500 })
    .custom(value => value % 100 === 0)
    .withMessage('Level must be in increments of 100 (100, 200, 300, 400, 500)'),
  body('semester')
    .isIn(['First', 'Second'])
    .withMessage('Semester must be either First or Second'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('prerequisites')
    .optional()
    .isArray()
    .withMessage('Prerequisites must be an array'),
  body('prerequisites.*')
    .optional()
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage('Prerequisite course codes must be between 3 and 10 characters'),
  body('maxStudents')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum students must be at least 1')
];

const validateCourseUpdate = [
  body('courseCode')
    .optional()
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage('Course code must be between 3 and 10 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 6 })
    .withMessage('Credits must be between 1 and 6'),
  body('department')
    .optional()
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
    .withMessage('Invalid department'),
  body('program')
    .optional()
    .isIn([
      'BSc Mining Engineering',
      'BSc Geological Engineering',
      'BSc Minerals Engineering',
      'BSc Petroleum Engineering',
      'BSc Mechanical Engineering',
      'BSc Electrical Engineering',
      'BSc Civil Engineering',
      'BSc Computer Science and Engineering',
      'BSc Mathematics',
      'BSc Physics',
      'BSc Chemistry',
      'BSc Environmental and Safety Engineering'
    ])
    .withMessage('Invalid program'),
  body('level')
    .optional()
    .isInt({ min: 100, max: 500 })
    .custom(value => value % 100 === 0)
    .withMessage('Level must be in increments of 100 (100, 200, 300, 400, 500)'),
  body('semester')
    .optional()
    .isIn(['First', 'Second'])
    .withMessage('Semester must be either First or Second'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('prerequisites')
    .optional()
    .isArray()
    .withMessage('Prerequisites must be an array'),
  body('prerequisites.*')
    .optional()
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage('Prerequisite course codes must be between 3 and 10 characters'),
  body('maxStudents')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum students must be at least 1')
];

const validateCourseFilters = [
  query('department')
    .optional()
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
    .withMessage('Invalid department'),
  query('program')
    .optional()
    .isIn([
      'BSc Mining Engineering',
      'BSc Geological Engineering',
      'BSc Minerals Engineering',
      'BSc Petroleum Engineering',
      'BSc Mechanical Engineering',
      'BSc Electrical Engineering',
      'BSc Civil Engineering',
      'BSc Computer Science and Engineering',
      'BSc Mathematics',
      'BSc Physics',
      'BSc Chemistry',
      'BSc Environmental and Safety Engineering'
    ])
    .withMessage('Invalid program'),
  query('level')
    .optional()
    .isInt({ min: 100, max: 500 })
    .custom(value => value % 100 === 0)
    .withMessage('Level must be in increments of 100 (100, 200, 300, 400, 500)'),
  query('semester')
    .optional()
    .isIn(['First', 'Second'])
    .withMessage('Semester must be either First or Second')
];

const validateCourseRegistration = [
  body('courseId')
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('semester')
    .isIn(['First', 'Second'])
    .withMessage('Semester must be either First or Second'),
  body('academicYear')
    .matches(/^\d{4}\/\d{4}$/)
    .withMessage('Academic year must be in format YYYY/YYYY')
];

const validateRegistrationFilters = [
  query('semester')
    .optional()
    .isIn(['First', 'Second'])
    .withMessage('Semester must be either First or Second'),
  query('academicYear')
    .optional()
    .matches(/^\d{4}\/\d{4}$/)
    .withMessage('Academic year must be in format YYYY/YYYY'),
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'dropped'])
    .withMessage('Invalid status')
];

const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

// Course routes
router.get('/', authenticateToken, validateCourseFilters, getCourses);
router.get('/stats', authenticateToken, requireAdmin, getCourseStats);
router.get('/:id', authenticateToken, validateObjectId, getCourseById);

// Admin-only course management routes
router.post('/', authenticateToken, requireAdmin, validateCourseCreation, createCourse);
router.put('/:id', authenticateToken, requireAdmin, validateObjectId, validateCourseUpdate, updateCourse);
router.delete('/:id', authenticateToken, requireAdmin, validateObjectId, deleteCourse);

// Course registration routes
router.post('/register', authenticateToken, requireStudent, validateCourseRegistration, registerForCourse);
router.get('/my-registrations', authenticateToken, requireStudent, validateRegistrationFilters, getMyRegistrations);

// Admin-only registration management routes
router.get('/registrations', authenticateToken, requireAdmin, validateRegistrationFilters, getAllRegistrations);
router.get('/registrations/stats', authenticateToken, requireAdmin, getRegistrationStats);
router.put('/registrations/:id/approve', authenticateToken, requireAdmin, validateObjectId, approveRegistration);
router.put('/registrations/:id/reject', authenticateToken, requireAdmin, validateObjectId, [
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], rejectRegistration);

module.exports = router; 