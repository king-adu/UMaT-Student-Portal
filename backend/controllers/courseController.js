const Course = require('../models/Course');
const CourseRegistration = require('../models/CourseRegistration');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses with filters
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: program
 *         schema:
 *           type: string
 *         description: Filter by program
 *       - in: query
 *         name: level
 *         schema:
 *           type: number
 *         description: Filter by level
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *           enum: [First, Second]
 *         description: Filter by semester
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 */
const getCourses = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { department, program, level, semester } = req.query;
    const filters = { department, program, level, semester };

    const courses = await Course.getCoursesByFilters(filters);

    res.json({
      success: true,
      data: courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
};

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 */
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course'
    });
  }
};

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseCode
 *               - title
 *               - credits
 *               - department
 *               - program
 *               - level
 *               - semester
 *             properties:
 *               courseCode:
 *                 type: string
 *               title:
 *                 type: string
 *               credits:
 *                 type: number
 *               department:
 *                 type: string
 *               program:
 *                 type: string
 *               level:
 *                 type: number
 *               semester:
 *                 type: string
 *               description:
 *                 type: string
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: string
 *               maxStudents:
 *                 type: number
 *     responses:
 *       201:
 *         description: Course created successfully
 */
const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const course = new Course(req.body);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating course'
    });
  }
};

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       200:
 *         description: Course updated successfully
 */
const updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course'
    });
  }
};

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted successfully
 */
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course'
    });
  }
};

/**
 * @swagger
 * /api/courses/stats:
 *   get:
 *     summary: Get course statistics (Admin only)
 *     tags: [Courses]
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
 * /api/courses/register:
 *   post:
 *     summary: Register for a course (Student only)
 *     tags: [Course Registration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - semester
 *               - academicYear
 *             properties:
 *               courseId:
 *                 type: string
 *               semester:
 *                 type: string
 *                 enum: [First, Second]
 *               academicYear:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course registration successful
 */
const registerForCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { courseId, semester, academicYear } = req.body;
    const studentId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is active
    if (!course.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Course is not active'
      });
    }

    // Check if course is full
    if (course.isFull) {
      return res.status(400).json({
        success: false,
        message: 'Course is full'
      });
    }

    // Create registration
    const registration = new CourseRegistration({
      student: studentId,
      course: courseId,
      semester,
      academicYear
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Course registration successful',
      data: registration
    });
  } catch (error) {
    console.error('Error registering for course:', error);
    
    if (error.message.includes('already registered')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error registering for course'
    });
  }
};

/**
 * @swagger
 * /api/courses/my-registrations:
 *   get:
 *     summary: Get student's course registrations
 *     tags: [Course Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *         description: Filter by semester
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *         description: Filter by academic year
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Student's registrations
 */
const getMyRegistrations = async (req, res) => {
  try {
    const { semester, academicYear, status } = req.query;
    const filters = { semester, academicYear, status };

    const registrations = await CourseRegistration.getByStudent(req.user._id, filters);

    res.json({
      success: true,
      data: registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations'
    });
  }
};

/**
 * @swagger
 * /api/courses/registrations/{id}/approve:
 *   put:
 *     summary: Approve course registration (Admin only)
 *     tags: [Course Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registration approved
 */
const approveRegistration = async (req, res) => {
  try {
    const registration = await CourseRegistration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    await registration.approve(req.user._id);

    res.json({
      success: true,
      message: 'Registration approved successfully',
      data: registration
    });
  } catch (error) {
    console.error('Error approving registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving registration'
    });
  }
};

/**
 * @swagger
 * /api/courses/registrations/{id}/reject:
 *   put:
 *     summary: Reject course registration (Admin only)
 *     tags: [Course Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration rejected
 */
const rejectRegistration = async (req, res) => {
  try {
    const { notes } = req.body;
    const registration = await CourseRegistration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    await registration.reject(req.user._id, notes);

    res.json({
      success: true,
      message: 'Registration rejected successfully',
      data: registration
    });
  } catch (error) {
    console.error('Error rejecting registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting registration'
    });
  }
};

/**
 * @swagger
 * /api/courses/registrations:
 *   get:
 *     summary: Get all registrations (Admin only)
 *     tags: [Course Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *         description: Filter by semester
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: All registrations
 */
const getAllRegistrations = async (req, res) => {
  try {
    const { courseId, semester, status } = req.query;
    
    let registrations;
    if (courseId) {
      registrations = await CourseRegistration.getByCourse(courseId, { semester, status });
    } else {
      registrations = await CourseRegistration.find({ semester, status })
        .populate('student', 'firstName lastName referenceNumber department program level')
        .populate('course', 'courseCode title credits department program level')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      data: registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations'
    });
  }
};

/**
 * @swagger
 * /api/courses/registrations/stats:
 *   get:
 *     summary: Get registration statistics (Admin only)
 *     tags: [Course Registration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Registration statistics
 */
const getRegistrationStats = async (req, res) => {
  try {
    const { semester, academicYear, status } = req.query;
    const filters = { semester, academicYear, status };

    const stats = await CourseRegistration.getRegistrationStats(filters);

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

module.exports = {
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
}; 