import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaArrowLeft, 
  FaHeart, 
  FaComment, 
  FaShare,
  FaThumbsUp,
  FaThumbsDown,
  FaSmile,
  FaImage
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DepartmentalNews = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const departments = [
    'Mining Engineering',
    'Mineral Engineering',
    'Geological Engineering',
    'Petroleum Engineering',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Computer Science and Engineering',
    'Environmental and Safety Engineering',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Liberal Studies',
  ];

  // Fetch news for selected department
  const fetchNews = async () => {
    if (!selectedDepartment) return;

    setLoading(true);
    try {
      const response = await api.get('/news', {
        params: {
          department: selectedDepartment,
          published: true,
        },
      });
      setNews(response.data.news);
    } catch (error) {
      toast.error('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedDepartment]);

  // Handle reaction
  const handleReaction = async (newsId, reactionType) => {
    try {
      await api.post(`/news/${newsId}/react`, { reactionType });
      toast.success('Reaction added successfully');
      fetchNews(); // Refresh to update reaction counts
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add reaction';
      toast.error(message);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (newsId) => {
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await api.post(`/news/${newsId}/comments`, { content: commentText });
      toast.success('Comment added successfully');
      setCommentText('');
      setShowCommentForm(null);
      fetchNews(); // Refresh to show new comment
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add comment';
      toast.error(message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                to="/student"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Departmental News</h1>
                <p className="text-sm text-gray-500">Stay updated with your department</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Department Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Department</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedDepartment === dept
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* News List */}
        {selectedDepartment && (
          <div className="space-y-6">
            {loading ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading news...</p>
              </div>
            ) : news.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <FaImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No news available for {selectedDepartment}.</p>
              </div>
            ) : (
              news.map((newsItem) => (
                <div key={newsItem._id} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* News Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {newsItem.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span>By {newsItem.author.firstName} {newsItem.author.lastName}</span>
                          <span>{formatDate(newsItem.createdAt)}</span>
                          {newsItem.featured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {newsItem.content}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* News Images */}
                  {newsItem.images && newsItem.images.length > 0 && (
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {newsItem.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`News image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interaction Bar */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        {/* Reactions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleReaction(newsItem._id, 'like')}
                            className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 transition-colors"
                          >
                            <FaThumbsUp className="h-4 w-4" />
                            <span className="text-sm">{newsItem.reactions?.like || 0}</span>
                          </button>
                          <button
                            onClick={() => handleReaction(newsItem._id, 'love')}
                            className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <FaHeart className="h-4 w-4" />
                            <span className="text-sm">{newsItem.reactions?.love || 0}</span>
                          </button>
                          <button
                            onClick={() => handleReaction(newsItem._id, 'smile')}
                            className="flex items-center space-x-1 text-gray-500 hover:text-yellow-600 transition-colors"
                          >
                            <FaSmile className="h-4 w-4" />
                            <span className="text-sm">{newsItem.reactions?.smile || 0}</span>
                          </button>
                        </div>

                        {/* Comments */}
                        <button
                          onClick={() => setShowCommentForm(showCommentForm === newsItem._id ? null : newsItem._id)}
                          className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 transition-colors"
                        >
                          <FaComment className="h-4 w-4" />
                          <span className="text-sm">{newsItem.comments?.length || 0}</span>
                        </button>
                      </div>

                      {/* Share */}
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 transition-colors">
                        <FaShare className="h-4 w-4" />
                        <span className="text-sm">Share</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="px-6 py-4">
                    {/* Comment Form */}
                    {showCommentForm === newsItem._id && (
                      <div className="mb-4">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                          rows="3"
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => setShowCommentForm(null)}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleCommentSubmit(newsItem._id)}
                            disabled={submittingComment || !commentText.trim()}
                            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {submittingComment ? 'Posting...' : 'Post Comment'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Comments List */}
                    {newsItem.comments && newsItem.comments.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Comments</h4>
                        {newsItem.comments.map((comment) => (
                          <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-600">
                                  {comment.author.firstName[0]}{comment.author.lastName[0]}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-gray-900">
                                    {comment.author.firstName} {comment.author.lastName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-gray-700">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DepartmentalNews; 