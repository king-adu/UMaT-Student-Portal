const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - firstName
 *         - lastName
 *         - phoneNumber
 *         - referenceNumber
 *         - password
 *         - department
 *         - program
 *         - level
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated user ID
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         phoneNumber:
 *           type: string
 *           description: User's phone number
 *         referenceNumber:
 *           type: string
 *           description: Student's reference number (unique)
 *         password:
 *           type: string
 *           description: Hashed password
 *         role:
 *           type: string
 *           enum: [student, admin]
 *           default: student
 *           description: User role
 *         department:
 *           type: string
 *           description: User's department
 *         program:
 *           type: string
 *           description: User's program of study
 *         level:
 *           type: number
 *           description: User's academic level
 *         isOnline:
 *           type: boolean
 *           default: false
 *           description: Online status
 *         lastSeen:
 *           type: string
 *           format: date-time
 *           description: Last seen timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date
 */

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^(\+233|0)[0-9]{9}$/, 'Please enter a valid Ghanaian phone number']
  },
  referenceNumber: {
    type: String,
    required: [true, 'Reference number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[0-9]{8,}$/, 'Reference number must be at least 8 digits']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
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
    ]
  },
  program: {
    type: String,
    required: [true, 'Program is required'],
    enum: [
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
    ]
  },
  level: {
    type: Number,
    required: [true, 'Level is required'],
    min: [100, 'Level must be at least 100'],
    max: [500, 'Level cannot exceed 500']
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  profilePicture: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.firstName;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ referenceNumber: 1 });
userSchema.index({ department: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isOnline: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update online status
userSchema.methods.updateOnlineStatus = async function(isOnline) {
  this.isOnline = isOnline;
  this.lastSeen = new Date();
  return await this.save();
};

// Static method to get online users
userSchema.statics.getOnlineUsers = function() {
  return this.find({ isOnline: true }).select('-password');
};

// Static method to get users by department
userSchema.statics.getUsersByDepartment = function(department) {
  return this.find({ department }).select('-password');
};

// Static method to get user statistics
userSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        totalStudents: {
          $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] }
        },
        totalAdmins: {
          $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
        },
        onlineUsers: {
          $sum: { $cond: [{ $eq: ['$isOnline', true] }, 1, 0] }
        }
      }
    }
  ]);

  const departmentStats = await this.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
        onlineCount: {
          $sum: { $cond: [{ $eq: ['$isOnline', true] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  return {
    overall: stats[0] || {
      totalUsers: 0,
      totalStudents: 0,
      totalAdmins: 0,
      onlineUsers: 0
    },
    byDepartment: departmentStats
  };
};

module.exports = mongoose.model('User', userSchema); 