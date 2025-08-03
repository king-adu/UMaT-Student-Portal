const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - student
 *         - amount
 *         - currency
 *         - paymentType
 *         - department
 *       properties:
 *         student:
 *           type: string
 *           description: Reference to the student making payment
 *         amount:
 *           type: number
 *           description: Payment amount
 *         currency:
 *           type: string
 *           default: NGN
 *           description: Payment currency
 *         paymentType:
 *           type: string
 *           enum: [tuition, accommodation, library, other]
 *           description: Type of payment
 *         department:
 *           type: string
 *           description: Student's department
 *         paystackReference:
 *           type: string
 *           description: Paystack transaction reference
 *         paystackAccessCode:
 *           type: string
 *           description: Paystack access code
 *         status:
 *           type: string
 *           enum: [pending, successful, failed, abandoned]
 *           default: pending
 *           description: Payment status
 *         description:
 *           type: string
 *           description: Payment description
 *         metadata:
 *           type: object
 *           description: Additional payment metadata
 */

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'NGN',
    enum: {
      values: ['NGN', 'USD', 'EUR', 'GBP'],
      message: 'Invalid currency'
    }
  },
  paymentType: {
    type: String,
    required: [true, 'Payment type is required'],
    enum: {
      values: ['tuition', 'accommodation', 'library', 'other'],
      message: 'Invalid payment type'
    }
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
  paystackReference: {
    type: String,
    unique: true,
    sparse: true
  },
  paystackAccessCode: {
    type: String
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'successful', 'failed', 'abandoned'],
      message: 'Invalid payment status'
    },
    default: 'pending'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  paidAt: {
    type: Date
  },
  failureReason: {
    type: String,
    trim: true
  },
  gatewayResponse: {
    type: String
  },
  channel: {
    type: String
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ student: 1, status: 1, createdAt: -1 });
paymentSchema.index({ department: 1, status: 1, createdAt: -1 });
paymentSchema.index({ paystackReference: 1 });
paymentSchema.index({ paymentType: 1, status: 1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount / 100); // Paystack amounts are in kobo
});

// Static method to get payments by student
paymentSchema.statics.getByStudent = function(studentId, filters = {}) {
  const query = { student: studentId };
  
  if (filters.status) query.status = filters.status;
  if (filters.paymentType) query.paymentType = filters.paymentType;
  if (filters.startDate) query.createdAt = { $gte: new Date(filters.startDate) };
  if (filters.endDate) {
    if (query.createdAt) {
      query.createdAt.$lte = new Date(filters.endDate);
    } else {
      query.createdAt = { $lte: new Date(filters.endDate) };
    }
  }
  
  return this.find(query)
    .sort({ createdAt: -1 });
};

// Static method to get payments by department
paymentSchema.statics.getByDepartment = function(department, filters = {}) {
  const query = { department };
  
  if (filters.status) query.status = filters.status;
  if (filters.paymentType) query.paymentType = filters.paymentType;
  if (filters.startDate) query.createdAt = { $gte: new Date(filters.startDate) };
  if (filters.endDate) {
    if (query.createdAt) {
      query.createdAt.$lte = new Date(filters.endDate);
    } else {
      query.createdAt = { $lte: new Date(filters.endDate) };
    }
  }
  
  return this.find(query)
    .populate('student', 'firstName lastName referenceNumber')
    .sort({ createdAt: -1 });
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function(filters = {}) {
  const matchStage = {};
  
  if (filters.status) matchStage.status = filters.status;
  if (filters.paymentType) matchStage.paymentType = filters.paymentType;
  if (filters.department) matchStage.department = filters.department;
  if (filters.startDate) matchStage.createdAt = { $gte: new Date(filters.startDate) };
  if (filters.endDate) {
    if (matchStage.createdAt) {
      matchStage.createdAt.$lte = new Date(filters.endDate);
    } else {
      matchStage.createdAt = { $lte: new Date(filters.endDate) };
    }
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          department: '$department',
          paymentType: '$paymentType',
          status: '$status'
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: {
          department: '$_id.department',
          paymentType: '$_id.paymentType'
        },
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
            totalAmount: '$totalAmount'
          }
        }
      }
    },
    {
      $group: {
        _id: '$_id.department',
        paymentTypes: {
          $push: {
            type: '$_id.paymentType',
            statuses: '$statuses'
          }
        }
      }
    }
  ]);
  
  return stats;
};

// Method to mark payment as successful
paymentSchema.methods.markSuccessful = async function(paystackData) {
  this.status = 'successful';
  this.paidAt = new Date();
  this.gatewayResponse = paystackData.gateway_response;
  this.channel = paystackData.channel;
  this.ipAddress = paystackData.ip_address;
  this.userAgent = paystackData.user_agent;
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markFailed = async function(paystackData) {
  this.status = 'failed';
  this.failureReason = paystackData.failure_reason;
  this.gatewayResponse = paystackData.gateway_response;
  return this.save();
};

// Method to mark payment as abandoned
paymentSchema.methods.markAbandoned = async function() {
  this.status = 'abandoned';
  return this.save();
};

// Ensure virtuals are included in JSON output
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Payment', paymentSchema); 