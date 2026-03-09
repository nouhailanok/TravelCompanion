import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';


const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [myPosts, setMyPosts] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [profileError, setProfileError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'trips'

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user || !user.id) { // Ensure user and user.id are available
        // If called before user context is ready, it might show error briefly.
        // AuthContext should ideally prevent rendering this page if not authenticated.
        setProfileError('User not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setProfileError('');

      try {
        // Fetch user's trips (backend should filter by owner)
        const tripsData = await apiService.getTrips(); 
        setMyTrips(tripsData || []);

        // Fetch all posts and then filter by owner client-side
        // This is okay for moderate numbers of posts, but for large scale, 
        // an API endpoint for user-specific posts would be better.
        const allPostsData = await apiService.getPosts();
        if (allPostsData) {
          const userPosts = allPostsData.filter(post => post.owner_details && post.owner_details.id === user.id);
          setMyPosts(userPosts);
        } else {
          setMyPosts([]);
        }

      } catch (err) {
        console.error("Failed to fetch profile data:", err);
        setProfileError(err.response?.data?.detail || err.message || 'Failed to load your profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  if (loading && !user) { // Handles case where user context is still loading initially
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading user data...</p>
        </div>
      </div>
    );
  }
  
  if (!user) { // If no user after context load (e.g. not logged in)
    return (
      <div className="min-h-screen bg-[#fffaf3] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-md w-full">
          <svg className="w-16 h-16 text-blue-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Profile Locked</h2>
          <p className="text-gray-600 mb-8">
            Please <Link to="/login" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold">login</Link> to view your profile.
          </p>
        </div>
      </div>
    );
  }

  if (loading) { // Loading profile data for an authenticated user
     return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */} 
        <div className="bg-white/80  backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 p-6 md:p-8 mb-10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg">
                    {user.username ? user.username[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-grow text-center sm:text-left">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">{user.username || 'Your Profile'}</h1>
                    <p className="text-gray-600 mt-1 text-md">{user.email || 'No email provided'}</p>
                    <div className="mt-4 flex justify-center sm:justify-start space-x-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-800">{myPosts.length}</p>
                            <p className="text-sm text-gray-500">Posts</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-800">{myTrips.length}</p>
                            <p className="text-sm text-gray-500">Trips</p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-auto">
                    <button 
                        onClick={handleLogout}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>

        {profileError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow">
            <div className="text-red-700 font-medium">Error: {profileError}</div>
          </div>
        )}

        {/* Tab Navigation */} 
        <div className="mb-8 border-b border-gray-300/80">
          <nav className="-mb-px flex justify-center space-x-4 sm:space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('posts')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm sm:text-md transition-colors duration-150
                ${activeTab === 'posts' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-t-md`} 
            >
              <svg className="w-5 h-5 inline-block mr-1.5 sm:mr-2 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
              MY POSTS
            </button>
            <button
              onClick={() => setActiveTab('trips')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm sm:text-md transition-colors duration-150
                ${activeTab === 'trips' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-t-md`}
            >
              <svg className="w-5 h-5 inline-block mr-1.5 sm:mr-2 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1M13 16l-4-4h8l-4 4zM20 11V5a1 1 0 00-1-1h-5a1 1 0 00-1 1v6a1 1 0 001 1h2"></path></svg>
              MY TRIPS
            </button>
          </nav>
        </div>

        {/* Content Area */} 
        <div>
          {activeTab === 'posts' && (
            myPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                {myPosts.map(post => (
                  <Link key={post.id} to={`/posts/${post.id}`} className="group relative aspect-square block bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                    {post.image ? (
                      <img src={post.image} alt={post.Add_Place || 'Post image'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                        <h3 className="text-white text-center text-sm font-semibold truncate">{post.Add_Place || 'Untitled Post'}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/60">
                <svg className="w-20 h-20 text-gray-400 mx-auto mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Posts Yet</h3>
                <p className="text-gray-500 mb-6">Looks like you haven't shared any travel experiences.</p>
                <Link to="/posts/new" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md">
                  Create Your First Post
                </Link>
              </div>
            )
          )}

          {activeTab === 'trips' && (
            myTrips.length > 0 ? (
              <div className="space-y-6">
                {myTrips.map(trip => (
                    <Link key={trip.id} to={`/trips/${trip.id}`} className="block bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                            <div className="flex-grow">
                                <h2 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">{trip.nom || 'Untitled Trip'}</h2>
                                <p className="text-sm text-gray-600 mt-1">Destination: <strong className="font-medium">{trip.destination}</strong></p>
                            </div>
                            <div className="flex-shrink-0 mt-2 sm:mt-0 text-sm text-gray-500 bg-gray-100/80 px-3 py-1.5 rounded-full shadow-sm">
                                {trip.trip_type || trip.type_voyage || 'General'}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">
                            Dates: {new Date(trip.start_date).toLocaleDateString()} &rarr; {new Date(trip.end_date).toLocaleDateString()}
                        </p>
                    </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/60">
                  <svg className="w-20 h-20 text-gray-400 mx-auto mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Trips Yet</h3>
                  <p className="text-gray-500 mb-6">Ready for an adventure? Plan your next trip now!</p>
                  <Link to="/trips/new" className="bg-gradient-to-r from-green-500 to-lime-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-lime-600 transition-all duration-300 transform hover:scale-105 shadow-md">
                    Create Your First Trip
                  </Link>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 