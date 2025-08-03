const News = require('../models/News');
const Comment = require('../models/Comment');
const Reaction = require('../models/Reaction');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Get news by department
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         required: true
 *         schema:
 *           type: string
 *         description: Department to filter news
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by tags
 *     responses:
 *       200:
 *         description: List of news
 */
const getNewsByDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { department } = req.query;
    const { priority, featured, tags } = req.query;
    const filters = { priority, featured, tags };

    const news = await News.getByDepartment(department, filters);

    res.json({
      success: true,
      data: news,
      count: news.length
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching news'
    });
  }
};

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     summary: Get news by ID
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News ID
 *     responses:
 *       200:
 *         description: News details
 */
const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('author', 'firstName lastName');

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    // Increment view count
    await news.incrementViewCount();

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching news'
    });
  }
};

/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Create news post (Admin only)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - department
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               department:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               allowComments:
 *                 type: boolean
 *               allowReactions:
 *                 type: boolean
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               priority:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: News created successfully
 */
const createNews = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const newsData = {
      ...req.body,
      author: req.user._id
    };

    const news = new News(newsData);
    await news.save();

    res.status(201).json({
      success: true,
      message: 'News created successfully',
      data: news
    });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating news'
    });
  }
};

/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     summary: Update news (Admin only)
 *     tags: [News]
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
 *             $ref: '#/components/schemas/News'
 *     responses:
 *       200:
 *         description: News updated successfully
 */
const updateNews = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const news = await News.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    res.json({
      success: true,
      message: 'News updated successfully',
      data: news
    });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating news'
    });
  }
};

/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     summary: Delete news (Admin only)
 *     tags: [News]
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
 *         description: News deleted successfully
 */
const deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    res.json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting news'
    });
  }
};

/**
 * @swagger
 * /api/news/{id}/toggle-featured:
 *   put:
 *     summary: Toggle featured status (Admin only)
 *     tags: [News]
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
 *         description: Featured status toggled
 */
const toggleFeatured = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    await news.toggleFeatured();

    res.json({
      success: true,
      message: `News ${news.featured ? 'featured' : 'unfeatured'} successfully`,
      data: news
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling featured status'
    });
  }
};

/**
 * @swagger
 * /api/news/{id}/toggle-published:
 *   put:
 *     summary: Toggle published status (Admin only)
 *     tags: [News]
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
 *         description: Published status toggled
 */
const togglePublished = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    await news.togglePublished();

    res.json({
      success: true,
      message: `News ${news.isPublished ? 'published' : 'unpublished'} successfully`,
      data: news
    });
  } catch (error) {
    console.error('Error toggling published status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling published status'
    });
  }
};

/**
 * @swagger
 * /api/news/stats:
 *   get:
 *     summary: Get news statistics (Admin only)
 *     tags: [News]
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
 * /api/news/{id}/comments:
 *   get:
 *     summary: Get comments for news
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News ID
 *     responses:
 *       200:
 *         description: List of comments
 */
const getComments = async (req, res) => {
  try {
    const comments = await Comment.getByNews(req.params.id, { isApproved: true });

    res.json({
      success: true,
      data: comments,
      count: comments.length
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments'
    });
  }
};

/**
 * @swagger
 * /api/news/{id}/comments:
 *   post:
 *     summary: Add comment to news
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               parentComment:
 *                 type: string
 *                 description: Parent comment ID for replies
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
const addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { content, parentComment } = req.body;
    const newsId = req.params.id;

    // Check if news exists and allows comments
    const news = await News.findById(newsId);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    if (!news.allowComments) {
      return res.status(400).json({
        success: false,
        message: 'Comments are not allowed for this news'
      });
    }

    const commentData = {
      content,
      author: req.user._id,
      news: newsId
    };

    if (parentComment) {
      commentData.parentComment = parentComment;
    }

    const comment = new Comment(commentData);
    await comment.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment'
    });
  }
};

/**
 * @swagger
 * /api/news/{id}/reactions:
 *   get:
 *     summary: Get reactions for news
 *     tags: [Reactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News ID
 *     responses:
 *       200:
 *         description: Reaction counts
 */
const getReactions = async (req, res) => {
  try {
    const reactionCounts = await Reaction.getReactionCounts(req.params.id);
    const userReaction = await Reaction.getUserReaction(req.user._id, req.params.id);

    res.json({
      success: true,
      data: {
        counts: reactionCounts,
        userReaction: userReaction ? userReaction.type : null
      }
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reactions'
    });
  }
};

/**
 * @swagger
 * /api/news/{id}/react:
 *   post:
 *     summary: Add reaction to news
 *     tags: [Reactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [like, love, laugh, wow, sad, angry]
 *     responses:
 *       201:
 *         description: Reaction added successfully
 */
const addReaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { type } = req.body;
    const newsId = req.params.id;

    // Check if news exists and allows reactions
    const news = await News.findById(newsId);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    if (!news.allowReactions) {
      return res.status(400).json({
        success: false,
        message: 'Reactions are not allowed for this news'
      });
    }

    // Check if user already reacted
    let reaction = await Reaction.getUserReaction(req.user._id, newsId);

    if (reaction) {
      // Update existing reaction
      reaction.type = type;
      await reaction.save();
    } else {
      // Create new reaction
      reaction = new Reaction({
        user: req.user._id,
        news: newsId,
        type
      });
      await reaction.save();
    }

    res.status(201).json({
      success: true,
      message: 'Reaction added successfully',
      data: reaction
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reaction'
    });
  }
};

/**
 * @swagger
 * /api/news/{id}/remove-reaction:
 *   delete:
 *     summary: Remove reaction from news
 *     tags: [Reactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News ID
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 */
const removeReaction = async (req, res) => {
  try {
    const reaction = await Reaction.findOneAndDelete({
      user: req.user._id,
      news: req.params.id
    });

    if (!reaction) {
      return res.status(404).json({
        success: false,
        message: 'Reaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Reaction removed successfully'
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing reaction'
    });
  }
};

module.exports = {
  getNewsByDepartment,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  toggleFeatured,
  togglePublished,
  getNewsStats,
  getComments,
  addComment,
  getReactions,
  addReaction,
  removeReaction
}; 