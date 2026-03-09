// reactapp/src/components/PostsListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../api';
import debounce from 'lodash.debounce'; // For debouncing search input
import { FaSearch, FaRegSadCry, FaPlusCircle, FaTimesCircle } from 'react-icons/fa'; // Added FaTimesCircle
import Navbar from './Navbar';


const PostsListPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // State for the search term
  const [startDate, setStartDate] = useState(''); // State for start date
  const [endDate, setEndDate] = useState(''); // State for end date
  // const [selectedCategory, setSelectedCategory] = useState('ALL'); // Kept for now, can be removed if not used
  // const categories = ['ALL', 'America', 'Europe', 'Asia', 'London', 'Geneva', 'Seoul']; // Kept for now

  // Debounced fetch function
  const debouncedFetchPosts = useCallback(
    debounce(async (term, sDate, eDate) => {
      try {
        setLoading(true);
        setError('');
        const data = await apiService.getPosts(term, sDate, eDate); // Pass search term and dates
        setPosts(data);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to fetch posts. Please try again.');
        setPosts([]); // Clear posts on error
      } finally {
        setLoading(false);
      }
    }, 500), // 500ms debounce delay
    [] // Empty dependency array for useCallback
  );

  useEffect(() => {
    debouncedFetchPosts(searchTerm, startDate, endDate); // Call debounced fetch on initial load and when searchTerm changes
    // Cleanup function to cancel any pending debounced calls if component unmounts
    return () => {
      debouncedFetchPosts.cancel();
    };
  }, [searchTerm, startDate, endDate, debouncedFetchPosts]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  if (loading && posts.length === 0) { // Show full page loader only if posts are empty initially
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading posts...</p>
        </div>
      </div>
    );
  }

  // Error display remains the same, but consider placing it more gracefully if posts are already visible
  if (error && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-md w-full shadow-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm0-4a1 1 0 112 0v1a1 1 0 11-2 0V7z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-md font-semibold text-red-700">Failed to load posts</h3>
              <div className="mt-1 text-sm text-red-600">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Navbar />
        {/* Header Section - Sticky */}
        <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/70 top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-5">
              <h1 className="text-3xl font-bold text-gray-800">Community Posts</h1>
              <Link
                to="/posts/new"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create New Post</span>
              </Link>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-150"
                      placeholder="Search posts by place or description..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                  />
              </div>

              {/* Date Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input 
                    type="date" 
                    name="startDate"
                    id="startDate"
                    value={startDate}
                    onChange={handleStartDateChange}
                    className="block w-full py-2.5 px-3 border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-150"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input 
                    type="date" 
                    name="endDate"
                    id="endDate"
                    value={endDate}
                    onChange={handleEndDateChange}
                    className="block w-full py-2.5 px-3 border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-150"
                  />
                </div>
              </div>
              
              {/* Clear Filters Button */}
              {(searchTerm || startDate || endDate) && (
                  <button 
                      onClick={clearFilters}
                      className="w-full md:w-auto text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors duration-150 flex items-center justify-center space-x-1.5"
                  >
                      <FaTimesCircle className="h-4 w-4" />
                      <span>Clear All Filters</span>
                  </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Inline loading indicator (spinner) when posts are already present but reloading */}
          {loading && posts.length > 0 && (
            <div className="flex justify-center items-center py-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Searching...</span>
            </div>
          )}

          {/* Error display when posts might already be visible */}
          {error && posts.length > 0 && (
             <div className="my-4 bg-red-50 border border-red-200 p-4 rounded-lg shadow-sm">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm0-4a1 1 0 112 0v1a1 1 0 11-2 0V7z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-red-700">{error}</p>
                    </div>
                </div>
            </div>
          )}

          {!loading && posts.length === 0 ? (
            <div className="text-center py-16">
              <FaRegSadCry className="mx-auto text-6xl text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm || startDate || endDate ? 'No posts match your filters' : 'No posts yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || startDate || endDate ? 'Try adjusting your search or date filters.' : 'Be the first to share your travel experiences!'}
              </p>
              {(searchTerm || startDate || endDate) ? (
                  <button 
                      onClick={clearFilters} 
                      className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-colors duration-150 shadow-md flex items-center justify-center space-x-2"
                  >
                      <FaTimesCircle />
                      <span>Clear Filters</span>
                  </button>
              ) : (
                <Link
                  to="/posts/new"
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-150 shadow-md"
                >
                  Create First Post
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post, index) => (
                // Keep the existing Link and post card structure
                // Ensure key={post.id} is on the outermost element of the map if not Link itself
                <div key={post.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300">
                    <Link to={`/posts/${post.id}`} className="block p-6 group">
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                            {post.owner_details?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                              {post.owner_details?.username || `User ${index + 1}`}
                            </h3>
                            {/* Consider using a date formatting library like date-fns or moment, or a custom function */}
                            <p className="text-sm text-gray-500">{new Date(post.created_at || Date.now()).toLocaleDateString()}  {/* Assuming created_at exists */}</p>
                          </div>
                        </div>
                        {/* More options button can be added here if needed */}
                        {/* <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button> */}
                      </div>

                      {/* Post Content */}
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:flex-1">
                          <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                              {post.Add_Place || "Untitled Post"}
                          </h2>
                          <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                            {post.Description || "No description available."}
                          </p>

                          {/* Engagement Actions */}
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2 text-gray-500">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span className="text-sm font-medium">
                                {post.likes_count !== undefined ? post.likes_count : (post.likes ? post.likes.length : 0)} likes
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-500">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span className="text-sm font-medium">
                                {post.comments_count !== undefined ? post.comments_count : (post.comments ? post.comments.length : 0)} comments
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Post Image */}
                        {post.image && (
                          <div className="lg:w-80 lg:max-w-xs xl:max-w-sm flex-shrink-0">
                            <div className="aspect-video lg:aspect-square rounded-xl overflow-hidden shadow-md border border-gray-200/50">
                              <img
                                src={post.image}
                                alt={post.Add_Place || 'Post image'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
              ))}
            </div>
          )}
        </div>
    </div>

  );
};

export default PostsListPage;