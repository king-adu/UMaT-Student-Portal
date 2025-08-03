const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     News:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - department
 *         - author
 *       properties:
 *         title:
 *           type: string
 *           description: News title
 *         content:
 *           type: string
 *           description: News content
 *         department:
 *           type: string
 *           enum: [Mining Engineering, Geological Engineering, Minerals Engineering, Petroleum Engineering, Mechanical Engineering, Electrical Engineering, Civil Engineering, Computer Science and Engineering, Mathematics, Physics, Chemistry, Environmental and Safety Engineering]
 *           description: Department the news is for
 *         author:
 *           type: string
 *           description: Reference to admin who created the post
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         isPublished:
 *           type: boolean
 *           default: true
 *           description: Whether the news is published
 *         allowComments:
 *           type: boolean
 *           default: true
 *           description: Whether comments are allowed
 *         allowReactions:
 *           type: boolean
 *           default: true
 *           description: Whether reactions are allowed
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags for categorizing news
 *         priority:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *           default: normal
 *           description: Priority level of the news
 */

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
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
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  images: [{
    type: String,
    trim: true
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  allowReactions: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: {
      values: ['low', 'normal', 'high', 'urgent'],
      message: 'Invalid priority level'
    },
    default: 'normal'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
newsSchema.index({ department: 1, isPublished: 1, createdAt: -1 });
newsSchema.index({ author: 1, createdAt: -1 });
newsSchema.index({ tags: 1 });
newsSchema.index({ priority: 1 });
newsSchema.index({ featured: 1 });

// Virtual for comment count
newsSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'news',
  count: true
});

// Virtual for reaction count
newsSchema.virtual('reactionCount', {
  ref: 'Reaction',
  localField: '_id',
  foreignField: 'news',
  count: true
});

// Virtual for checking if news is expired
newsSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Static method to get news by department
newsSchema.statics.getByDepartment = function(department, filters = {}) {
  const query = { 
    department, 
    isPublished: true 
  };
  
  if (filters.priority) query.priority = filters.priority;
  if (filters.featured !== undefined) query.featured = filters.featured;
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  return this.find(query)
    .populate('author', 'firstName lastName')
    .sort({ priority: -1, createdAt: -1 });
};

// Static method to get news statistics
newsSchema.statics.getNewsStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: {
          department: '$department',
          priority: '$priority',
          isPublished: '$isPublished'
        },
        count: { $sum: 1 },
        totalViews: { $sum: '$viewCount' }
      }
    },
    {
      $group: {
        _id: {
          department: '$_id.department',
          isPublished: '$_id.isPublished'
        },
        priorities: {
          $push: {
            priority: '$_id.priority',
            count: '$count',
            totalViews: '$totalViews'
          }
        }
      }
    },
    {
      $group: {
        _id: '$_id.department',
        published: {
          $push: {
            $cond: [
              { $eq: ['$_id.isPublished', true] },
              { priorities: '$priorities' },
              '$$REMOVE'
            ]
          }
        },
        unpublished: {
          $push: {
            $cond: [
              { $eq: ['$_id.isPublished', false] },
              { priorities: '$priorities' },
              '$$REMOVE'
            ]
          }
        }
      }
    }
  ]);
  
  return stats;
};

// Method to increment view count
newsSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  return this.save();
};

// Method to toggle featured status
newsSchema.methods.toggleFeatured = async function() {
  this.featured = !this.featured;
  return this.save();
};

// Method to publish/unpublish
newsSchema.methods.togglePublished = async function() {
  this.isPublished = !this.isPublished;
  return this.save();
};

// Ensure virtuals are included in JSON output
newsSchema.set('toJSON', { virtuals: true });
newsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('News', newsSchema); 