// reactapp/src/App.js
import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
// import HomePage from './components/HomePage'; // Create a simple HomePage component
import ProtectedRoute from './components/ProtectedRoute'; // For later
import { useAuth } from './context/AuthContext';
import DashboardPage from './components/DashboardPage'; // <--- IMPORT
import TripsListPage from './components/TripsListPage'; // <--- IMPORT TripsListPage
import CreateTripPage from './components/CreateTripPage.js'; // <--- IMPORT (will create next)
import TripDetailPage from './components/TripDetailPage.js'; // <--- IMPORT (will create next)
import EditTripPage from './components/EditTripPage'; // <--- IMPORT (will create next)
import CreateActivityPage from './components/CreateActivityPage'; // <--- IMPORT (will create next)
import EditActivityPage from './components/EditActivityPage'; // <--- IMPORT (will create next)
import PostsListPage from './components/PostsListPage';
import CreatePostPage from './components/CreatePostPage'; // <--- IMPORT THIS
import PostDetailPage from './components/PostDetailPage'; // <--- ADD THIS IMPORT
import EditPostPage from './components/EditPostPage'; // Add this
import ProfilePage from './components/ProfilePage'; // <--- IMPORT PROFILE PAGE
// <--- IMPORT

// Simple HomePage placeholder
// Simple HomePage placeholder
const HomePage = () => {
  const { isAuthenticated, logout, user } = useAuth(); // 'user' is now populated
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fffaf3]">

      <hr />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-6xl md:text-7xl font-bold text-black mb-6 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-[#b39ddb] to-[#f8bbd0] bg-clip-text text-transparent">
                TravelCompanion
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-black/80 max-w-3xl mx-auto leading-relaxed">
              Découvrez des destinations extraordinaires, planifiez vos aventures et créez des souvenirs inoubliables
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
            {isAuthenticated && user ? (
              <div className="space-y-8">
                {/* User Welcome */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-xl">
                    <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-black mb-4">
                    Bon retour, <span className="text-black">{user.username}</span> !
                  </h2>
                  <p className="text-black/80 text-lg mb-2">
                    Connecté en tant que: <strong className="text-black">{user.email}</strong>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Link
                    to="/dashboard"
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-lg">Dashboard</h3>
                        <p className="text-white/80 text-sm">Gérez vos voyages</p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/trips"
                    className="group bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-lg">Mes Voyages</h3>
                        <p className="text-white/80 text-sm">Explorez vos aventures</p>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-[#b39ddb] to-[#f8bbd0] text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:from-[#9575cd] hover:to-[#f06292] transition-all duration-300"
                  >
                  Se déconnecter
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Welcome Message */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full mb-6 shadow-xl">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-black mb-4">
                    Commencez votre aventure
                  </h2>
                  <p className="text-black/80 text-lg">
                    Connectez-vous ou créez un compte pour accéder à toutes nos fonctionnalités
                  </p>
                </div>

                {/* Auth Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/login"
                    className="bg-gradient-to-r from-[#b39ddb] to-[#f8bbd0] text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:from-[#9575cd] hover:to-[#f06292] transition-all duration-300"
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-[#b39ddb] to-[#f8bbd0] text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:from-[#9575cd] hover:to-[#f06292] transition-all duration-300"
                  >
                    Créer un compte
                  </Link>
                </div>
              </div>
            )}
          </div>


          {/* FAQ Section */}
          <div className="mt-24 mb-16 max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-10 border border-blue-100">
            <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* FAQ Accordéon */}
              <div>
                <details className="mb-4 group">
                  <summary className="cursor-pointer font-semibold text-lg text-blue-900 bg-blue-50 rounded-xl px-4 py-3 group-open:bg-blue-100 transition">What services does Travel Companion provide?</summary>
                  <div className="pl-4 pr-2 py-2 text-gray-700">We offer trip planning, destination suggestions, itinerary management, and a travel community.</div>
                </details>
                <details className="mb-4 group">
                  <summary className="cursor-pointer font-semibold text-lg text-blue-900 bg-blue-50 rounded-xl px-4 py-3 group-open:bg-blue-100 transition">How can I create and manage my travel plans?</summary>
                  <div className="pl-4 pr-2 py-2 text-gray-700">Sign up, log in, and use the dashboard to add, edit, or remove your trips easily.</div>
                </details>
                <details className="mb-4 group">
                  <summary className="cursor-pointer font-semibold text-lg text-blue-900 bg-blue-50 rounded-xl px-4 py-3 group-open:bg-blue-100 transition">Can I share my travel plans with friends or the community?</summary>
                  <div className="pl-4 pr-2 py-2 text-gray-700">Yes! You can share your trips and get suggestions from other travelers.</div>
                </details>
                <details className="mb-4 group">
                  <summary className="cursor-pointer font-semibold text-lg text-blue-900 bg-blue-50 rounded-xl px-4 py-3 group-open:bg-blue-100 transition">Is my data safe and private?</summary>
                  <div className="pl-4 pr-2 py-2 text-gray-700">Absolutely. We use secure protocols to protect your information.</div>
                </details>
              </div>
              {/* Images for FAQ aesthetics */}
              <div className="flex flex-col gap-4">
                <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" alt="beach" className="rounded-2xl shadow-lg w-full h-40 object-cover" />
                <img src="https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=400&q=80" alt="mountain" className="rounded-2xl shadow-lg w-full h-40 object-cover" />
              </div>
            </div>
          </div>

          {/* Contact Us Section */}
          <div className="bg-[#cce6f7] py-12 px-4 rounded-t-3xl">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-blue-800 mb-4">Have questions or doubts?</h3>
              <p className="mb-6 text-blue-900">Contact us and we'll get back to you as soon as possible!</p>
              <form className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
                <input type="text" placeholder="Your Name" className="px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                <input type="email" placeholder="Your Email" className="px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                <textarea placeholder="Your Message" rows={4} className="px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                <button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-400 text-white font-semibold py-3 rounded-xl shadow-md hover:from-blue-600 hover:to-purple-500 transition">Send</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




function App() {
  const { isAuthenticated, logout, loadingAuth } = useAuth();
  const navigate = useNavigate();


  if (loadingAuth) {
    return <div>Loading authentication...</div>;
  }

  return (
    <div>
      <hr />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}> {/* Wrap protected routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trips" element={<TripsListPage />} />
          <Route path="/trips/new" element={<CreateTripPage />} /> {/* <--- ADD THIS ROUTE */}
          <Route path="/trips/:tripId" element={<TripDetailPage />} /> {/* <--- ADD THIS DYNAMIC ROUTE */}
          <Route path="/trips/:tripId/edit" element={<EditTripPage />} /> {/* <--- ADD THIS DYNAMIC ROUTE */}
          <Route path="/trips/:tripId/activities/new" element={<CreateActivityPage />} /> {/* <--- ADD THIS ROUTE */}
          <Route path="/trips/:tripId/activities/:activityId/edit" element={<EditActivityPage />} /> {/* <--- ADD THIS ROUTE */}
          <Route path="/posts" element={<PostsListPage />} /> {/* <--- ADD POSTS LIST ROUTE */}
          <Route path="/posts/new" element={<CreatePostPage />} /> {/* <--- CHECK THIS ROUTE */}
          <Route path="/posts/:postId" element={<PostDetailPage />} /> {/* <--- ADD THIS ROUTE */}
          <Route path="/posts/edit/:postId" element={<EditPostPage />} />
          <Route path="/profile" element={<ProfilePage />} /> {/* <--- ADD PROFILE ROUTE */}
          {/* <--- ADD TRIPS LIST PAGE */}
          {/* Add more protected routes here as children of ProtectedRoute */}
          {/* e.g., <Route path="/trips/new" element={<CreateTripPage />} /> */}
        </Route>
        {/* Add more routes here, e.g., for Trips, Posts using ProtectedRoute */}
        {/* <Route path="/trips" element={<ProtectedRoute><TripsPage /></ProtectedRoute>} /> */}
      </Routes>
    </div>
  );
}

export default App;