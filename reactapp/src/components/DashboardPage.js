import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../api';
import Navbar from './Navbar';

const DashboardPage = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [communityPosts, setCommunityPosts] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [dashboardError, setDashboardError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setDashboardError('');

      try {
        const tripsData = await apiService.getTrips();
        setMyTrips(tripsData || []);

        const allPostsData = await apiService.getPosts();
        setCommunityPosts(allPostsData || []);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setDashboardError(err.response?.data?.detail || err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchDashboardData();
    } else if (!isAuthenticated) {
      setLoading(false);
      setCommunityPosts([]);
      setMyTrips([]);
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading && isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fffaf3] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-md w-full">
          <svg className="w-16 h-16 text-blue-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Welcome!</h2>
          <p className="text-gray-600 mb-8">
            Please <Link to="/login" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold">login</Link> or <Link to="/register" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold">register</Link> to access your dashboard.
          </p>
          <Link to="/posts" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md inline-block">
            View Community Posts
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-700 font-medium">User data not available. Please try logging in again.</p>
          <button onClick={handleLogout} className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Navbar />
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">User Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, <strong>{user.username}</strong>! ({user.email})
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dashboardError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow">
            <div className="text-red-700 font-medium">Error: {dashboardError}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">My Trips ({myTrips.length})</h2>
              <Link to="/trips/new" className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors transform hover:scale-105 shadow-sm flex items-center space-x-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                <span>New Trip</span>
              </Link>
            </div>
            {loading && !myTrips.length ? (
              <p className="text-gray-500 py-4 italic">Loading trips...</p>
            ) : myTrips.length > 0 ? (
              <div className="space-y-4">
                {myTrips.slice(0, 3).map(trip => (
                  <div key={trip.id} className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <Link to={`/trips/${trip.id}`} className="block hover:text-blue-600">
                          <h3 className="text-lg font-semibold text-gray-800">{trip.nom || 'Untitled Trip'}</h3>
                        </Link>
                        <span className="text-xs text-white bg-gradient-to-r from-green-400 to-blue-500 px-2.5 py-1 rounded-full font-medium shadow-sm">
                          {trip.trip_type || trip.type_voyage || 'General'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Destination: <strong>{trip.destination}</strong></p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                      </p>
                      <Link to={`/trips/${trip.id}`} className="text-sm text-blue-500 hover:text-blue-600 hover:underline mt-3 inline-block font-medium">
                        View Details &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
                {myTrips.length > 3 && (
                  <Link to="/trips" className="block text-center mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm">
                    View All My Trips ({myTrips.length})
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50/70 rounded-xl border border-gray-200/80 shadow-sm">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                <p className="text-gray-600 mb-4 font-medium">You haven't created any trips yet.</p>
                <Link to="/trips/new" className="bg-gradient-to-r from-green-500 to-lime-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-green-600 hover:to-lime-600 transition-all duration-300 transform hover:scale-105 shadow-md">
                  Plan a New Trip
                </Link>
              </div>
            )}
          </section>

          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Community Posts ({communityPosts.length})</h2>
              <Link to="/posts/new" className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors transform hover:scale-105 shadow-sm flex items-center space-x-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                <span>New Post</span>
              </Link>
            </div>
            {loading && !communityPosts.length ? (
              <p className="text-gray-500 py-4 italic">Loading posts...</p>
            ) : communityPosts.length > 0 ? (
              <div className="space-y-4">
                {communityPosts.slice(0, 3).map(post => (
                  <div key={post.id} className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {post.owner_details?.username && (
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {post.owner_details.username[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <Link to={`/posts/${post.id}`} className="block hover:text-blue-600">
                            <h3 className="text-lg font-semibold text-gray-800">{post.Add_Place || 'Untitled Post'}</h3>
                          </Link>
                          {post.owner_details && <p className="text-xs text-gray-500">By: {post.owner_details.username}</p>}
                        </div>
                      </div>
                      {post.image && (
                        <img src={post.image} alt={post.Add_Place} className="mt-3 w-full h-40 object-cover rounded-lg shadow-sm" />
                      )}
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        {post.Description ? (post.Description.length > 100 ? post.Description.substring(0, 97) + '...' : post.Description) : 'No description.'}
                      </p>
                      <Link to={`/posts/${post.id}`} className="text-sm text-blue-500 hover:text-blue-600 hover:underline mt-3 inline-block font-medium">
                        Read More &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
                {communityPosts.length > 3 && (
                  <Link to="/posts" className="block text-center mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm">
                    View All Community Posts ({communityPosts.length})
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50/70 rounded-xl border border-gray-200/80 shadow-sm">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                <p className="text-gray-600 mb-4 font-medium">No community posts found yet.</p>
                <Link to="/posts/new" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md">
                  Be the First to Share!
                </Link>
              </div>
            )}
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-300/70">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Quick Links</h3>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 hover:underline font-medium">My Dashboard</Link>
            <Link to="/trips" className="text-gray-600 hover:text-blue-600 hover:underline font-medium">All My Trips</Link>
            <Link to="/posts" className="text-gray-600 hover:text-blue-600 hover:underline font-medium">All Community Posts</Link>
            <Link to="/profile" className="text-gray-600 hover:text-blue-600 hover:underline font-medium">My Profile</Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;