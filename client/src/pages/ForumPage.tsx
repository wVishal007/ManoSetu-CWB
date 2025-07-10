import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Plus, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  Send,
  Filter,
  Search,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'general', label: 'General Discussion' },
  { value: 'anxiety', label: 'Anxiety Support' },
  { value: 'depression', label: 'Depression Support' },
  { value: 'stress', label: 'Stress Management' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'work', label: 'Work & Career' },
  { value: 'support', label: 'Peer Support' }
];

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'oldest', label: 'Oldest First' }
];

export const ForumPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create post form
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
    isAnonymous: true,
    tags: []
  });

  // Comment form
  const [newComment, setNewComment] = useState({
    content: '',
    isAnonymous: true
  });

  // Flag form
  const [flagReason, setFlagReason] = useState('');
  const [showFlagModal, setShowFlagModal] = useState<{ type: 'post' | 'comment', id: string } | null>(null);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, sortBy]);

  const loadPosts = async () => {
    try {
      const response = await apiService.getPosts(selectedCategory, sortBy, 20, 1);
      setPosts(response.posts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPostDetails = async (postId: string) => {
    try {
      const response = await apiService.getPost(postId);
      setSelectedPost(response.post);
      setComments(response.comments);
    } catch (error) {
      console.error('Error loading post details:', error);
      toast.error('Failed to load post details');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.createPost(newPost);
      toast.success('Post created successfully!');
      setShowCreatePost(false);
      setNewPost({
        title: '',
        content: '',
        category: 'general',
        isAnonymous: true,
        tags: []
      });
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.content.trim() || !selectedPost) return;

    setIsSubmitting(true);
    try {
      await apiService.addComment(selectedPost._id, newComment);
      toast.success('Comment added successfully!');
      setNewComment({ content: '', isAnonymous: true });
      loadPostDetails(selectedPost._id);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (type: 'post' | 'comment', id: string, voteType: 'upvote' | 'downvote') => {
    try {
      if (type === 'post') {
        await apiService.votePost(id, voteType);
      } else {
        await apiService.voteComment(id, voteType);
      }
      
      if (selectedPost) {
        loadPostDetails(selectedPost._id);
      }
      loadPosts();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const handleFlag = async () => {
    if (!showFlagModal || !flagReason.trim()) {
      toast.error('Please provide a reason for flagging');
      return;
    }

    try {
      await apiService.flagPost(showFlagModal.id, flagReason);
      toast.success('Content flagged for review');
      setShowFlagModal(null);
      setFlagReason('');
    } catch (error) {
      console.error('Error flagging content:', error);
      toast.error('Failed to flag content');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 to-sky-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-sky-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Forum</h1>
            <p className="text-gray-600">Connect with others in a safe, anonymous environment.</p>
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="bg-gradient-to-r from-mint-600 to-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:from-mint-700 hover:to-sky-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Post</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6 sticky top-8">
              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Search className="h-4 w-4 inline mr-1" />
                    Search Posts
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Filter className="h-4 w-4 inline mr-1" />
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!selectedPost ? (
              /* Posts List */
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white rounded-xl shadow-sm border border-mint-100 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => loadPostDetails(post._id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                        <p className="text-gray-600 line-clamp-3">{post.content}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="bg-mint-100 text-mint-700 px-2 py-1 rounded-full text-xs font-medium capitalize">
                          {post.category}
                        </span>
                        <span>
                          {post.author ? `By ${post.author}` : 'Anonymous'}
                        </span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.upvoteCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredPosts.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No posts found</p>
                    <p className="text-sm text-gray-400">Be the first to start a discussion!</p>
                  </div>
                )}
              </div>
            ) : (
              /* Post Details */
              <div className="space-y-6">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-mint-600 hover:text-mint-700 font-medium"
                >
                  ← Back to posts
                </button>

                {/* Post */}
                <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-gray-900 mb-3">{selectedPost.title}</h1>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <span className="bg-mint-100 text-mint-700 px-2 py-1 rounded-full text-xs font-medium capitalize">
                          {selectedPost.category}
                        </span>
                        <span>
                          {selectedPost.author ? `By ${selectedPost.author}` : 'Anonymous'}
                        </span>
                        <span>{new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleVote('post', selectedPost._id, 'upvote')}
                        className="flex items-center space-x-1 text-gray-600 hover:text-mint-600 transition-colors"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{selectedPost.upvoteCount}</span>
                      </button>
                      <button
                        onClick={() => handleVote('post', selectedPost._id, 'downvote')}
                        className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>{selectedPost.downvoteCount}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setShowFlagModal({ type: 'post', id: selectedPost._id })}
                      className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Flag className="h-4 w-4" />
                      <span>Flag</span>
                    </button>
                  </div>
                </div>

                {/* Comments */}
                <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Comments ({comments.length})
                  </h2>

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="mb-6">
                    <div className="space-y-4">
                      <textarea
                        value={newComment.content}
                        onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                        placeholder="Share your thoughts..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                        rows={3}
                        maxLength={1000}
                      />
                      
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newComment.isAnonymous}
                            onChange={(e) => setNewComment({ ...newComment, isAnonymous: e.target.checked })}
                            className="rounded border-gray-300 text-mint-600 focus:ring-mint-500"
                          />
                          <span className="text-sm text-gray-600">Post anonymously</span>
                        </label>
                        
                        <button
                          type="submit"
                          disabled={!newComment.content.trim() || isSubmitting}
                          className="bg-gradient-to-r from-mint-600 to-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:from-mint-700 hover:to-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                        >
                          <Send className="h-4 w-4" />
                          <span>Comment</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment._id} className="border-l-4 border-mint-200 pl-4 py-2">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>
                              {comment.author ? comment.author : 'Anonymous'}
                            </span>
                            <span>•</span>
                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                          <button
                            onClick={() => setShowFlagModal({ type: 'comment', id: comment._id })}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Flag className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-gray-700 mb-2">{comment.content}</p>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleVote('comment', comment._id, 'upvote')}
                            className="flex items-center space-x-1 text-gray-600 hover:text-mint-600 transition-colors text-sm"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>{comment.upvoteCount}</span>
                          </button>
                          <button
                            onClick={() => handleVote('comment', comment._id, 'downvote')}
                            className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors text-sm"
                          >
                            <ThumbsDown className="h-3 w-3" />
                            <span>{comment.downvoteCount}</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {comments.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No comments yet</p>
                        <p className="text-sm text-gray-400">Be the first to comment!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Create New Post</h2>
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      placeholder="What's on your mind?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                      maxLength={200}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newPost.category}
                      onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                    >
                      {categories.slice(1).map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      placeholder="Share your thoughts, experiences, or ask for support..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                      rows={6}
                      maxLength={2000}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">{newPost.content.length}/2000 characters</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={newPost.isAnonymous}
                      onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })}
                      className="rounded border-gray-300 text-mint-600 focus:ring-mint-500"
                    />
                    <label htmlFor="anonymous" className="text-sm text-gray-600">
                      Post anonymously
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreatePost(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-mint-600 to-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:from-mint-700 hover:to-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Post'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Flag Modal */}
        {showFlagModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Flag Content</h2>
                </div>

                <p className="text-gray-600 mb-4">
                  Please provide a reason for flagging this content. Our moderators will review it.
                </p>

                <textarea
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Reason for flagging..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  maxLength={200}
                />

                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => setShowFlagModal(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFlag}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Flag Content
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};