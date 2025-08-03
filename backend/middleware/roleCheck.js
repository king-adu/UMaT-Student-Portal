/**
 * Role-based access control middleware
 */

/**
 * Middleware to check if user is admin
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user is student
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const requireStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user is either admin or student
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!['admin', 'student'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Invalid user role.'
    });
  }

  next();
};

/**
 * Middleware to check if user can access department-specific content
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const checkDepartmentAccess = (req, res, next) => {
  const { department } = req.params;
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Admins can access all departments
  if (req.user.role === 'admin') {
    return next();
  }

  // Students can only access their own department
  if (req.user.role === 'student' && req.user.department === department) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access content from your department.'
  });
};

/**
 * Middleware to check if user can access their own resources
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const checkOwnership = (req, res, next) => {
  const { userId } = req.params;
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Admins can access all resources
  if (req.user.role === 'admin') {
    return next();
  }

  // Students can only access their own resources
  if (req.user.role === 'student' && req.user._id.toString() === userId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own resources.'
  });
};

/**
 * Middleware to check if user has permission to manage content
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const checkContentPermission = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Only admins can manage content
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only administrators can manage content.'
    });
  }

  next();
};

module.exports = {
  requireAdmin,
  requireStudent,
  requireAuth,
  checkDepartmentAccess,
  checkOwnership,
  checkContentPermission
}; 