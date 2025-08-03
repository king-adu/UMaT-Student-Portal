const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - author
 *         - news
 *       properties:
 *         content:
 *           type: string
 *           description: Comment content
 *         author:
 *           type: string
 *           description: Reference to user who made the comment
 *         news:
 *           type: string
 *           description: Reference to the news post
 *         parentComment:
 *           type: string
 *           description: Reference to parent comment for replies
 *         isApproved:
 *           type: boolean
 *           default: true
 *           description: Whether the comment is approved
 *         isEdited:
 *           type: boolean
 *           default: false
 *           description: Whether the comment has been edited
 *         editedAt:
 *           type: string
 *           format: date-time
 *           description: When the comment was last edited
 */

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  news: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: [true, 'News reference is required']
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
commentSchema.index({ news: 1, isApproved: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

// Virtual for reply count
commentSchema.virtual('replyCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  count: true
});

// Virtual for total reactions
commentSchema.virtual('totalReactions').get(function() {
  return this.likes + this.dislikes;
});

// Static method to get comments by news
commentSchema.statics.getByNews = function(newsId, filters = {}) {
  const query = { news: newsId };
  
  if (filters.isApproved !== undefined) query.isApproved = filters.isApproved;
  if (filters.parentComment !== undefined) query.parentComment = filters.parentComment;
  
  return this.find(query)
    .populate('author', 'firstName lastName department program level')
    .populate('parentComment', 'content author')
    .sort({ createdAt: 1 });
};

// Static method to get comments by author
commentSchema.statics.getByAuthor = function(authorId, filters = {}) {
  const query = { author: authorId };
  
  if (filters.isApproved !== undefined) query.isApproved = filters.isApproved;
  
  return this.find(query)
    .populate('news', 'title department')
    .populate('parentComment', 'content')
    .sort({ createdAt: -1 });
};

// Method to approve comment
commentSchema.methods.approve = async function() {
  this.isApproved = true;
  return this.save();
};

// Method to reject comment
commentSchema.methods.reject = async function() {
  this.isApproved = false;
  return this.save();
};

// Method to edit comment
commentSchema.methods.edit = async function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Method to increment likes
commentSchema.methods.incrementLikes = async function() {
  this.likes += 1;
  return this.save();
};

// Method to decrement likes
commentSchema.methods.decrementLikes = async function() {
  if (this.likes > 0) {
    this.likes -= 1;
    return this.save();
  }
  return this;
};

// Method to increment dislikes
commentSchema.methods.incrementDislikes = async function() {
  this.dislikes += 1;
  return this.save();
};

// Method to decrement dislikes
commentSchema.methods.decrementDislikes = async function() {
  if (this.dislikes > 0) {
    this.dislikes -= 1;
    return this.save();
  }
  return this;
};

// Ensure virtuals are included in JSON output
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Comment', commentSchema); 