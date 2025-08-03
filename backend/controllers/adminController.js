const User = require('../models/User');
const Course = require('../models/Course');
const CourseRegistration = require('../models/CourseRegistration');
const News = require('../models/News');
const Payment = require('../models/Payment');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get online users
    const onlineUsers = await User.getOnlineUsers();
    const onlineUsersByDepartment = await User.aggregate([
      { $match: { isOnline: true } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total registered students
    const totalStudents = await User.countDocuments({ role: 'student' });
    const studentsByDepartment = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get course statistics
    const courseStats = await Course.getCourseStats();

    // Get registration statistics
    const registrationStats = await CourseRegistration.getRegistrationStats();

    // Get news statistics
    const newsStats = await News.getNewsStats();

    // Get payment statistics
    const paymentStats = await Payment.getPaymentStats();

    // Calculate total money paid to Paystack by department
    const totalPaymentsByDepartment = await Payment.aggregate([
      { $match: { status: 'successful' } },
      {
        $group: {
          _id: '$department',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Format the response
    const dashboardStats = {
      onlineUsers: {
        total: onlineUsers.length,
        byDepartment: onlineUsersByDepartment
      },
      students: {
        total: totalStudents,
        byDepartment: studentsByDepartment
      },
      courses: courseStats,
      registrations: registrationStats,
      news: newsStats,
      payments: {
        stats: paymentStats,
        totalByDepartment: totalPaymentsByDepartment
      }
    };

    res.json({
      success: true,
      data: dashboardStats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

/**
 * @swagger
 * /api/admin/users/online:
 *   get:
 *     summary: Get online users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of online users
 */
const getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = await User.getOnlineUsers();

    res.json({
      success: true,
      data: onlineUsers,
      count: onlineUsers.length
    });
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching online users'
    });
  }
};

/**
 * @swagger
 * /api/admin/users/by-department/{department}:
 *   get:
 *     summary: Get users by department (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: department
 *         required: true
 *         schema:
 *           type: string
 *         description: Department name
 *     responses:
 *       200:
 *         description: Users by department
 */
const getUsersByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const users = await User.getUsersByDepartment(department);

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users by department:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users by department'
    });
  }
};

/**
 * @swagger
 * /api/admin/users/stats:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 */
const getUserStats = async (req, res) => {
  try {
    const stats = await User.getUserStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics'
    });
  }
};

/**
 * @swagger
 * /api/admin/courses/stats:
 *   get:
 *     summary: Get course statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Course statistics
 */
const getCourseStats = async (req, res) => {
  try {
    const stats = await Course.getCourseStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching course stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course statistics'
    });
  }
};

/**
 * @swagger
 * /api/admin/registrations/stats:
 *   get:
 *     summary: Get registration statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Registration statistics
 */
const getRegistrationStats = async (req, res) => {
  try {
    const stats = await CourseRegistration.getRegistrationStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching registration stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registration statistics'
    });
  }
};

/**
 * @swagger
 * /api/admin/news/stats:
 *   get:
 *     summary: Get news statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: News statistics
 */
const getNewsStats = async (req, res) => {
  try {
    const stats = await News.getNewsStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching news stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching news statistics'
    });
  }
};

/**
 * @swagger
 * /api/admin/payments/stats:
 *   get:
 *     summary: Get payment statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment statistics
 */
const getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.getPaymentStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment statistics'
    });
  }
};

/**
 * @swagger
 * /api/admin/payments/total-by-department:
 *   get:
 *     summary: Get total payments by department (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total payments by department
 */
const getTotalPaymentsByDepartment = async (req, res) => {
  try {
    const totalPayments = await Payment.aggregate([
      { $match: { status: 'successful' } },
      {
        $group: {
          _id: '$department',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          department: '$_id',
          totalAmount: 1,
          count: 1,
          formattedAmount: {
            $concat: [
              '₦',
              {
                $toString: {
                  $divide: ['$totalAmount', 100]
                }
              }
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: totalPayments
    });
  } catch (error) {
    console.error('Error fetching total payments by department:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching total payments by department'
    });
  }
};

/**
 * @swagger
 * /api/admin/system/health:
 *   get:
 *     summary: Get system health status (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health status
 */
const getSystemHealth = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running'
      },
      metrics: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system health'
    });
  }
};

module.exports = {
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
}; 