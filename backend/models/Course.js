const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - courseCode
 *         - title
 *         - credits
 *         - department
 *         - program
 *         - level
 *         - semester
 *       properties:
 *         courseCode:
 *           type: string
 *           description: Unique course code
 *         title:
 *           type: string
 *           description: Course title
 *         credits:
 *           type: number
 *           description: Number of credit hours
 *         department:
 *           type: string
 *           enum: [Mining Engineering, Geological Engineering, Minerals Engineering, Petroleum Engineering, Mechanical Engineering, Electrical Engineering, Civil Engineering, Computer Science and Engineering, Mathematics, Physics, Chemistry, Environmental and Safety Engineering]
 *           description: Department offering the course
 *         program:
 *           type: string
 *           enum: [BSc Mining Engineering, BSc Geological Engineering, BSc Minerals Engineering, BSc Petroleum Engineering, BSc Mechanical Engineering, BSc Electrical Engineering, BSc Civil Engineering, BSc Computer Science and Engineering, BSc Mathematics, BSc Physics, BSc Chemistry, BSc Environmental and Safety Engineering]
 *           description: Program offering the course
 *         level:
 *           type: number
 *           minimum: 100
 *           maximum: 500
 *           description: Academic level (100-500)
 *         semester:
 *           type: string
 *           enum: [First, Second]
 *           description: Semester offered
 *         description:
 *           type: string
 *           description: Course description
 *         prerequisites:
 *           type: array
 *           items:
 *             type: string
 *           description: Prerequisite course codes
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the course is currently active
 *         maxStudents:
 *           type: number
 *           description: Maximum number of students allowed
 *         currentEnrollment:
 *           type: number
 *           default: 0
 *           description: Current number of enrolled students
 */

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  credits: {
    type: Number,
    required: [true, 'Credit hours are required'],
    min: [1, 'Credits must be at least 1'],
    max: [6, 'Credits cannot exceed 6']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: {
      values: [
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
      ],
      message: 'Invalid department'
    }
  },
  program: {
    type: String,
    required: [true, 'Program is required'],
    enum: {
      values: [
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
      ],
      message: 'Invalid program'
    }
  },
  level: {
    type: Number,
    required: [true, 'Level is required'],
    min: [100, 'Level must be at least 100'],
    max: [500, 'Level cannot exceed 500'],
    validate: {
      validator: function(v) {
        return v % 100 === 0;
      },
      message: 'Level must be in increments of 100 (100, 200, 300, 400, 500)'
    }
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: {
      values: ['First', 'Second'],
      message: 'Semester must be either First or Second'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  prerequisites: [{
    type: String,
    trim: true,
    uppercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  maxStudents: {
    type: Number,
    min: [1, 'Maximum students must be at least 1']
  },
  currentEnrollment: {
    type: Number,
    default: 0,
    min: [0, 'Current enrollment cannot be negative']
  }
}, {
  timestamps: true
});

// Index for efficient queries
courseSchema.index({ department: 1, program: 1, level: 1, semester: 1 });
courseSchema.index({ courseCode: 1 });
courseSchema.index({ isActive: 1 });

// Virtual for checking if course is full
courseSchema.virtual('isFull').get(function() {
  return this.maxStudents && this.currentEnrollment >= this.maxStudents;
});

// Virtual for available spots
courseSchema.virtual('availableSpots').get(function() {
  if (!this.maxStudents) return null;
  return Math.max(0, this.maxStudents - this.currentEnrollment);
});

// Static method to get courses by department, program, level, and semester
courseSchema.statics.getCoursesByFilters = function(filters) {
  const query = { isActive: true };
  
  if (filters.department) query.department = filters.department;
  if (filters.program) query.program = filters.program;
  if (filters.level) query.level = filters.level;
  if (filters.semester) query.semester = filters.semester;
  
  return this.find(query).sort({ courseCode: 1 });
};

// Static method to get course statistics
courseSchema.statics.getCourseStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: {
          department: '$department',
          program: '$program',
          level: '$level',
          semester: '$semester'
        },
        totalCourses: { $sum: 1 },
        totalCredits: { $sum: '$credits' },
        totalEnrollment: { $sum: '$currentEnrollment' },
        maxCapacity: { $sum: '$maxStudents' }
      }
    },
    {
      $group: {
        _id: {
          department: '$_id.department',
          program: '$_id.program'
        },
        levels: {
          $push: {
            level: '$_id.level',
            semester: '$_id.semester',
            totalCourses: '$totalCourses',
            totalCredits: '$totalCredits',
            totalEnrollment: '$totalEnrollment',
            maxCapacity: '$maxCapacity'
          }
        }
      }
    },
    {
      $group: {
        _id: '$_id.department',
        programs: {
          $push: {
            program: '$_id.program',
            levels: '$levels'
          }
        }
      }
    }
  ]);
  
  return stats;
};

// Method to increment enrollment
courseSchema.methods.incrementEnrollment = async function() {
  if (this.isFull) {
    throw new Error('Course is full');
  }
  this.currentEnrollment += 1;
  return this.save();
};

// Method to decrement enrollment
courseSchema.methods.decrementEnrollment = async function() {
  if (this.currentEnrollment > 0) {
    this.currentEnrollment -= 1;
    return this.save();
  }
  return this;
};

// Ensure virtuals are included in JSON output
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema); 