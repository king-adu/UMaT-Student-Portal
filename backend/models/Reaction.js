const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Reaction:
 *       type: object
 *       required:
 *         - user
 *         - news
 *         - type
 *       properties:
 *         user:
 *           type: string
 *           description: Reference to user who reacted
 *         news:
 *           type: string
 *           description: Reference to the news post
 *         type:
 *           type: string
 *           enum: [like, love, laugh, wow, sad, angry]
 *           description: Type of reaction
 */

const reactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  news: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: [true, 'News reference is required']
  },
  type: {
    type: String,
    required: [true, 'Reaction type is required'],
    enum: {
      values: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
      message: 'Invalid reaction type'
    }
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate reactions from same user
reactionSchema.index(
  { user: 1, news: 1 },
  { unique: true }
);

// Index for efficient queries
reactionSchema.index({ news: 1, type: 1 });
reactionSchema.index({ user: 1, createdAt: -1 });

// Static method to get reactions by news
reactionSchema.statics.getByNews = function(newsId) {
  return this.find({ news: newsId })
    .populate('user', 'firstName lastName department program level')
    .sort({ createdAt: -1 });
};

// Static method to get reaction counts by news
reactionSchema.statics.getReactionCounts = async function(newsId) {
  const counts = await this.aggregate([
    { $match: { news: mongoose.Types.ObjectId(newsId) } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Convert to object format
  const reactionCounts = {
    like: 0,
    love: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
    angry: 0,
    total: 0
  };
  
  counts.forEach(item => {
    reactionCounts[item._id] = item.count;
    reactionCounts.total += item.count;
  });
  
  return reactionCounts;
};

// Static method to get user's reaction to news
reactionSchema.statics.getUserReaction = function(userId, newsId) {
  return this.findOne({ user: userId, news: newsId });
};

// Static method to get reaction statistics
reactionSchema.statics.getReactionStats = async function() {
  const stats = await this.aggregate([
    {
      $lookup: {
        from: 'news',
        localField: 'news',
        foreignField: '_id',
        as: 'newsInfo'
      }
    },
    { $unwind: '$newsInfo' },
    {
      $group: {
        _id: {
          department: '$newsInfo.department',
          reactionType: '$type'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.department',
        reactions: {
          $push: {
            type: '$_id.reactionType',
            count: '$count'
          }
        }
      }
    }
  ]);
  
  return stats;
};

// Method to change reaction type
reactionSchema.methods.changeType = async function(newType) {
  this.type = newType;
  return this.save();
};

module.exports = mongoose.model('Reaction', reactionSchema); 