const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     CourseRegistration:
 *       type: object
 *       required:
 *         - student
 *         - course
 *         - semester
 *         - academicYear
 *       properties:
 *         student:
 *           type: string
 *           description: Reference to the student user
 *         course:
 *           type: string
 *           description: Reference to the course
 *         semester:
 *           type: string
 *           enum: [First, Second]
 *           description: Semester for registration
 *         academicYear:
 *           type: string
 *           description: Academic year (e.g., "2023/2024")
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, dropped]
 *           default: pending
 *           description: Registration status
 *         registeredAt:
 *           type: string
 *           format: date-time
 *           description: When the registration was made
 *         approvedAt:
 *           type: string
 *           format: date-time
 *           description: When the registration was approved
 *         approvedBy:
 *           type: string
 *           description: Reference to admin who approved
 *         notes:
 *           type: string
 *           description: Additional notes or comments
 */

const courseRegistrationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: {
      values: ['First', 'Second'],
      message: 'Semester must be either First or Second'
    }
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}\/\d{4}$/, 'Academic year must be in format YYYY/YYYY']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'dropped'],
      message: 'Invalid status'
    },
    default: 'pending'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
courseRegistrationSchema.index(
  { student: 1, course: 1, semester: 1, academicYear: 1 },
  { unique: true }
);

// Index for efficient queries
courseRegistrationSchema.index({ student: 1, status: 1 });
courseRegistrationSchema.index({ course: 1, status: 1 });
courseRegistrationSchema.index({ semester: 1, academicYear: 1 });

// Pre-save middleware to validate registration
courseRegistrationSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Check if student is already registered for this course in this semester/year
    const existingRegistration = await this.constructor.findOne({
      student: this.student,
      course: this.course,
      semester: this.semester,
      academicYear: this.academicYear
    });

    if (existingRegistration) {
      return next(new Error('Student is already registered for this course in this semester'));
    }

    // Check if course is full
    const Course = mongoose.model('Course');
    const course = await Course.findById(this.course);
    
    if (course && course.isFull) {
      return next(new Error('Course is full'));
    }
  }
  next();
});

// Post-save middleware to update course enrollment
courseRegistrationSchema.post('save', async function(doc) {
  const Course = mongoose.model('Course');
  
  if (doc.status === 'approved') {
    await Course.findByIdAndUpdate(doc.course, {
      $inc: { currentEnrollment: 1 }
    });
  }
});

// Post-update middleware to handle status changes
courseRegistrationSchema.post('findOneAndUpdate', async function(doc) {
  if (!doc) return;
  
  const Course = mongoose.model('Course');
  const update = this.getUpdate();
  
  // If status changed to approved, increment enrollment
  if (update.status === 'approved' && doc.status !== 'approved') {
    await Course.findByIdAndUpdate(doc.course, {
      $inc: { currentEnrollment: 1 }
    });
  }
  
  // If status changed from approved to something else, decrement enrollment
  if (doc.status === 'approved' && update.status !== 'approved') {
    await Course.findByIdAndUpdate(doc.course, {
      $inc: { currentEnrollment: -1 }
    });
  }
});

// Static method to get registrations by student
courseRegistrationSchema.statics.getByStudent = function(studentId, filters = {}) {
  const query = { student: studentId };
  
  if (filters.semester) query.semester = filters.semester;
  if (filters.academicYear) query.academicYear = filters.academicYear;
  if (filters.status) query.status = filters.status;
  
  return this.find(query)
    .populate('course', 'courseCode title credits department program level')
    .populate('approvedBy', 'firstName lastName')
    .sort({ registeredAt: -1 });
};

// Static method to get registrations by course
courseRegistrationSchema.statics.getByCourse = function(courseId, filters = {}) {
  const query = { course: courseId };
  
  if (filters.semester) query.semester = filters.semester;
  if (filters.academicYear) query.academicYear = filters.academicYear;
  if (filters.status) query.status = filters.status;
  
  return this.find(query)
    .populate('student', 'firstName lastName referenceNumber department program level')
    .populate('approvedBy', 'firstName lastName')
    .sort({ registeredAt: -1 });
};

// Static method to get registration statistics
courseRegistrationSchema.statics.getRegistrationStats = async function(filters = {}) {
  const matchStage = {};
  
  if (filters.semester) matchStage.semester = filters.semester;
  if (filters.academicYear) matchStage.academicYear = filters.academicYear;
  if (filters.status) matchStage.status = filters.status;
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'courseInfo'
      }
    },
    { $unwind: '$courseInfo' },
    {
      $group: {
        _id: {
          department: '$courseInfo.department',
          program: '$courseInfo.program',
          level: '$courseInfo.level',
          semester: '$semester'
        },
        totalRegistrations: { $sum: 1 },
        pendingRegistrations: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approvedRegistrations: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        rejectedRegistrations: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        totalCredits: { $sum: '$courseInfo.credits' }
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
            totalRegistrations: '$totalRegistrations',
            pendingRegistrations: '$pendingRegistrations',
            approvedRegistrations: '$approvedRegistrations',
            rejectedRegistrations: '$rejectedRegistrations',
            totalCredits: '$totalCredits'
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

// Method to approve registration
courseRegistrationSchema.methods.approve = async function(adminId) {
  this.status = 'approved';
  this.approvedAt = new Date();
  this.approvedBy = adminId;
  return this.save();
};

// Method to reject registration
courseRegistrationSchema.methods.reject = async function(adminId, notes = '') {
  this.status = 'rejected';
  this.approvedAt = new Date();
  this.approvedBy = adminId;
  if (notes) this.notes = notes;
  return this.save();
};

// Method to drop registration
courseRegistrationSchema.methods.drop = async function() {
  this.status = 'dropped';
  return this.save();
};

module.exports = mongoose.model('CourseRegistration', courseRegistrationSchema); 