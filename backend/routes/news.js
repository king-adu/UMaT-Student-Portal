const express = require('express');
const { body, query, param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireStudent } = require('../middleware/roleCheck');
const {
  getNewsByDepartment,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  toggleFeatured,
  togglePublished,
  getNewsStats,
  getComments,
  addComment,
  getReactions,
  addReaction,
  removeReaction
} = require('../controllers/newsController');

const router = express.Router();

// Validation middleware
const validateNewsCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
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
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid image URL'),
  body('allowComments')
    .optional()
    .isBoolean()
    .withMessage('Allow comments must be a boolean'),
  body('allowReactions')
    .optional()
    .isBoolean()
    .withMessage('Allow reactions must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tags must be between 1 and 50 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];

const validateNewsUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
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
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid image URL'),
  body('allowComments')
    .optional()
    .isBoolean()
    .withMessage('Allow comments must be a boolean'),
  body('allowReactions')
    .optional()
    .isBoolean()
    .withMessage('Allow reactions must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tags must be between 1 and 50 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];

const validateNewsFilters = [
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
    .withMessage('Invalid department'),
  query('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  query('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  query('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tags must be between 1 and 50 characters')
];

const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  body('parentComment')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID')
];

const validateReaction = [
  body('type')
    .isIn(['like', 'love', 'laugh', 'wow', 'sad', 'angry'])
    .withMessage('Invalid reaction type')
];

const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

// News routes
router.get('/', authenticateToken, validateNewsFilters, getNewsByDepartment);
router.get('/stats', authenticateToken, requireAdmin, getNewsStats);
router.get('/:id', authenticateToken, validateObjectId, getNewsById);

// Admin-only news management routes
router.post('/', authenticateToken, requireAdmin, validateNewsCreation, createNews);
router.put('/:id', authenticateToken, requireAdmin, validateObjectId, validateNewsUpdate, updateNews);
router.delete('/:id', authenticateToken, requireAdmin, validateObjectId, deleteNews);
router.put('/:id/toggle-featured', authenticateToken, requireAdmin, validateObjectId, toggleFeatured);
router.put('/:id/toggle-published', authenticateToken, requireAdmin, validateObjectId, togglePublished);

// Comment routes
router.get('/:id/comments', authenticateToken, validateObjectId, getComments);
router.post('/:id/comments', authenticateToken, validateObjectId, validateComment, addComment);

// Reaction routes
router.get('/:id/reactions', authenticateToken, validateObjectId, getReactions);
router.post('/:id/react', authenticateToken, validateObjectId, validateReaction, addReaction);
router.delete('/:id/remove-reaction', authenticateToken, validateObjectId, removeReaction);

module.exports = router; 