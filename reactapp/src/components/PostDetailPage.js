// reactapp/src/components/PostDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../api';
import { useAuth } from '../context/AuthContext';
import MapDisplay from './MapDisplay';
import Navbar from './Navbar';      

const PostDetailPage = () => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { postId } = useParams();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // State for new comment
    const [newCommentText, setNewCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [commentError, setCommentError] = useState('');

    // State for Likes
    const [isLiking, setIsLiking] = useState(false);

    // State for Post Deletion
    const [isDeletingPost, setIsDeletingPost] = useState(false);
    const [postDeleteError, setPostDeleteError] = useState('');

    const fetchPostDetails = useCallback(async () => {
        if (!postId) return;
        setLoading(true);
        setError('');
        setCommentError('');
        try {
            const data = await apiService.getPostDetails(postId);
            setPost(data);
        } catch (err) {
            console.error(`Failed to fetch post ${postId}:`, err);
            setError(err.response?.data?.detail || err.message || 'Failed to load post details.');
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchPostDetails();
    }, [fetchPostDetails]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim()) {
            setCommentError("Comment cannot be empty.");
            return;
        }
        setIsSubmittingComment(true);
        setCommentError('');

        try {
            const commentData = {
                text: newCommentText,
                post_id: parseInt(postId, 10)
            };
            await apiService.createComment(commentData);
            setNewCommentText('');
            fetchPostDetails();
        } catch (err) {
            console.error("Failed to submit comment:", err);
            setCommentError(err.response?.data?.text || err.response?.data?.detail || "Failed to post comment. Please try again.");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentIdToDelete) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) {
            return;
        }

        try {
            await apiService.deleteComment(commentIdToDelete);
            fetchPostDetails();
        } catch (err) {
            console.error("Failed to delete comment:", err);
            setCommentError(err.response?.data?.detail || "Failed to delete comment.");
        }
    };

    const handleLikeToggle = async () => {
        if (!isAuthenticated) {
            alert("Please log in to like posts.");
            return;
        }
        if (isLiking || !post) return;

        setIsLiking(true);
        try {
            if (post.current_user_like_id) {
                await apiService.unlikePost(post.current_user_like_id);
                setPost(prevPost => ({
                    ...prevPost,
                    likes_count: Math.max(0, prevPost.likes_count - 1),
                    current_user_like_id: null
                }));
            } else {
                const newLike = await apiService.likePost(parseInt(postId, 10));
                setPost(prevPost => ({
                    ...prevPost,
                    likes_count: prevPost.likes_count + 1,
                    current_user_like_id: newLike.id
                }));
            }
        } catch (err) {
            console.error("Failed to toggle like:", err);
            alert(err.response?.data?.detail || "Could not update like status. Please try again.");
        } finally {
            setIsLiking(false);
        }
    };

    const handleDeletePost = async () => {
        if (!post || !post.id) return;
        if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            return;
        }
        setIsDeletingPost(true);
        setPostDeleteError('');
        try {
            await apiService.deletePost(post.id);
            alert("Post deleted successfully.");
            navigate('/posts');
        } catch (err) {
            console.error("Failed to delete post:", err);
            const errorMessage = err.response?.data?.detail || err.message || "Failed to delete post. Please try again.";
            setPostDeleteError(errorMessage);
        } finally {
            setIsDeletingPost(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF8EF] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading post details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FFF8EF] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-4">
                        <div className="text-red-700 font-medium">Error: {error}</div>
                    </div>
                    <Link
                        to="/posts"
                        className="bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
                    >
                        Back to Posts
                    </Link>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-[#FFF8EF] flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Post not found</h3>
                    <Link
                        to="/posts"
                        className="bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
                    >
                        Back to Posts
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF8EF]">
            <Navbar />
            {/* Header */}
            <div className="bg-white/60 backdrop-blur-sm border-b border-amber-200/50 top-16 z-40">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link
                        to="/posts"
                        className="inline-flex items-center space-x-2 text-amber-700 hover:text-amber-800 font-medium transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        <span>Back to Posts</span>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                    {/* Post Image */}
                    {post.image && (
                        <div className="relative">
                            <img
                                src={post.image}
                                alt={post.Add_Place}
                                className="w-full h-96 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        </div>
                    )}

                    {/* Post Content */}
                    <div className="p-8">
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                    {post.owner_details?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-lg">
                                        {post.owner_details?.username || 'Unknown User'}
                                    </h3>
                                    {post.created_at ? (
                                        <p className="text-sm text-gray-500">
                                            {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-500">Date not available</p> 
                                    )}
                                </div>
                            </div>

                            {/* Post Actions for Owner */}
                            {isAuthenticated && user && post.owner_details?.id === user.id && (
                                <div className="flex items-center space-x-2">
                                    <Link
                                        to={`/posts/edit/${post.id}`}
                                        className="text-amber-600 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                        </svg>
                                    </Link>
                                    <button
                                        onClick={handleDeletePost}
                                        disabled={isDeletingPost}
                                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Post Title */}
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            {post.Add_Place || "Untitled Post"}
                        </h1>

                        {/* Post Description */}
                        <div className="prose prose-lg max-w-none text-gray-700 mb-8">
                            <p className="leading-relaxed whitespace-pre-wrap">
                                {post.Description || "No description."}
                            </p>
                        </div>

                        {/* Map Display */}
                        {post.latitude && post.longitude && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Location</h3>
                                <MapDisplay 
                                    centerLatitude={post.latitude}
                                    centerLongitude={post.longitude}
                                    popupText={post.Add_Place || 'Post Location'}
                                    mapHeight="300px"
                                />
                            </div>
                        )}

                        {/* Like Section */}
                        <div className="flex items-center space-x-6 py-6 border-t border-gray-200">
                            <button
                                onClick={handleLikeToggle}
                                disabled={isLiking || !isAuthenticated}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                                    post.current_user_like_id 
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                        : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'
                                }`}
                            >
                                <svg className={`w-5 h-5 ${post.current_user_like_id ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                </svg>
                                <span>
                                    {isLiking ? 'Loading...' : (post.current_user_like_id ? 'Unlike' : 'Like')}
                                </span>
                                <span className="bg-white px-2 py-1 rounded-full text-sm">
                                    {post.likes_count}
                                </span>
                            </button>
                        </div>

                        {/* Comments Section */}
                        <div className="border-t border-gray-200 pt-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">
                                Comments ({post.comments ? post.comments.length : 0})
                            </h3>

                            {/* Add Comment Form */}
                            {isAuthenticated ? (
                                <form onSubmit={handleCommentSubmit} className="mb-8">
                                    <div className="flex space-x-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                            {user?.username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <textarea
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                                                rows="3"
                                                placeholder="Write a comment..."
                                                value={newCommentText}
                                                onChange={(e) => setNewCommentText(e.target.value)}
                                                required
                                                disabled={isSubmittingComment}
                                            />
                                            {commentError && (
                                                <p className="text-red-500 text-sm mt-2">{commentError}</p>
                                            )}
                                            <div className="flex justify-end mt-3">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmittingComment}
                                                    className="bg-amber-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50"
                                                >
                                                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 text-center">
                                    <p className="text-amber-800 mb-4">Please log in to leave a comment</p>
                                    <Link
                                        to="/login"
                                        className="bg-amber-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
                                    >
                                        Log In
                                    </Link>
                                </div>
                            )}

                            {/* Comments List */}
                            <div className="space-y-6">
                                {post.comments && post.comments.length > 0 ? (
                                    post.comments.map(comment => (
                                        <div key={comment.id} className="flex space-x-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                {comment.user_details?.username?.[0]?.toUpperCase() || 'A'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h4 className="font-semibold text-gray-800">
                                                            {comment.user_details?.username || 'Anonymous'}
                                                        </h4>
                                                        <div className="flex items-center space-x-2">
                                                            {comment.created_at ? (
                                                                <span className="text-sm text-gray-500">
                                                                    {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date(comment.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-gray-500"></span>
                                                            )}
                                                            {isAuthenticated && user && comment.user_details?.id === user.id && (
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                            </svg>
                                        </div>
                                        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Delete Post Error */}
                        {postDeleteError && (
                            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                <div className="text-red-700 font-medium">{postDeleteError}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetailPage;