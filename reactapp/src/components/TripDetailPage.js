// reactapp/src/components/TripDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../api';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import MapDisplay from './MapDisplay';
import Navbar from './Navbar';


const TripDetailPage = () => {
  const [trip, setTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [error, setError] = useState('');
  const [activityError, setActivityError] = useState('');
  const { tripId } = useParams();
  const [isDeletingTrip, setIsDeletingTrip] = useState(false);
  const navigate = useNavigate();

  const fetchTripDetail = useCallback(async () => {
    if (!tripId) return;
    setLoadingTrip(true);
    try {
      setError('');
      const tripData = await apiService.getTripDetails(tripId);
      setTrip(tripData);
    } catch (err) {
      console.error(`Failed to fetch trip ${tripId}:`, err);
      if (err.response && err.response.status === 404) {
        setError('Trip not found. It may have been deleted or you might not have access.');
      } else if (err.response && err.response.status === 403) {
        setError('You do not have permission to view this trip.');
      } else {
        setError(err.response?.data?.detail || 'Failed to fetch trip details. Please try again.');
      }
    } finally {
      setLoadingTrip(false);
    }
  }, [tripId]);

  const fetchActivities = useCallback(async () => {
    if (!tripId) return;
    setLoadingActivities(true);
    setActivityError('');
    try {
      const activitiesData = await apiService.getActivitiesForTrip(tripId);
      setActivities(activitiesData);
    } catch (err) {
      console.error(`Failed to fetch activities for trip ${tripId}:`, err);
      setActivityError(err.response?.data?.detail || 'Failed to load activities for this trip.');
    } finally {
      setLoadingActivities(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTripDetail();
  }, [fetchTripDetail]);

  useEffect(() => {
    if (trip && !loadingTrip) {
      fetchActivities();
    }
  }, [trip, loadingTrip, fetchActivities]);

  const handleDeleteTrip = async () => {
    if (!window.confirm('Are you sure you want to delete this trip and all its activities? This action cannot be undone.')) {
      return;
    }
    setIsDeletingTrip(true);
    setError('');
    try {
      await apiService.deleteTrip(tripId);
      navigate('/trips'); // Redirect to trips list after successful deletion
    } catch (err) {
      console.error(`Failed to delete trip ${tripId}:`, err);
      setError(err.response?.data?.detail || 'Failed to delete trip. Please try again.');
      setIsDeletingTrip(false);
    }
  };

  const handleToggleTerminee = async (activityId, currentTermineeStatus) => {
    setActivityError('');
    const newTermineeStatus = !currentTermineeStatus;
    const originalActivities = [...activities];

    setActivities(prevActivities =>
      prevActivities.map(act =>
        act.id === activityId ? { ...act, terminee: newTermineeStatus } : act
      )
    );

    try {
      await apiService.updateActivity(activityId, { terminee: newTermineeStatus });
    } catch (err) {
      console.error(`Failed to toggle 'terminee' for activity ${activityId}:`, err);
      setActivityError(err.response?.data?.detail || 'Failed to update activity status. Please try refreshing.');
      setActivities(originalActivities);
    }
  };

  const handleDeleteActivity = async (activityIdToDelete) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    setActivityError('');
    const originalActivities = [...activities];
    setActivities(prevActivities =>
        prevActivities.filter(activity => activity.id !== activityIdToDelete)
    );

    try {
      await apiService.deleteActivity(activityIdToDelete);
      // Consider a success message or rely on UI change
    } catch (err) {
      console.error(`Failed to delete activity ${activityIdToDelete}:`, err);
      setActivityError(err.response?.data?.detail || 'Failed to delete activity. Please try refreshing.');
      setActivities(originalActivities);
    }
  };

  if (loadingTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error && !trip) { // If there's an error and no trip data could be fetched
    return (
      <div className="min-h-screen bg-[#fffaf3] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-lg w-full">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Error Loading Trip</h2>
            <p className="text-red-600 bg-red-50 p-3 rounded-md mb-6">{error}</p>
            <Link
                to="/trips"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
            >
                Back to My Trips
            </Link>
        </div>
      </div>
    );
  }

  if (!trip && !loadingTrip) { // Should be caught by error state typically, but as a fallback
    return (
        <div className="min-h-screen bg-[#fffaf3] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Trip Not Found</h2>
                <p className="text-gray-600 mb-6">The trip you are looking for could not be found.</p>
                <Link to="/trips" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold">Back to My Trips</Link>
            </div>
        </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Navbar />
      {/* Header Section for Trip Name and Actions */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-800 truncate" title={trip.nom}>
              Trip: {trip.nom}
            </h1>
            <div className="flex-shrink-0 flex gap-3">
              <Link
                to={`/trips/${trip.id}/edit`}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                <span>Edit Trip</span>
              </Link>
              <button
                onClick={handleDeleteTrip}
                disabled={isDeletingTrip}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                <span>{isDeletingTrip ? 'Deleting...' : 'Delete Trip'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trip Details Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Trip Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Destination</dt>
              <dd className="mt-1 text-md text-gray-900 font-semibold">{trip.destination}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Trip Type</dt>
              <dd className="mt-1 text-md text-gray-900">{trip.trip_type || trip.type_voyage || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Start Date</dt>
              <dd className="mt-1 text-md text-gray-900">{new Date(trip.start_date).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">End Date</dt>
              <dd className="mt-1 text-md text-gray-900">{new Date(trip.end_date).toLocaleDateString()}</dd>
            </div>
            {trip.owner_details && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Organized By</dt>
                <dd className="mt-1 text-md text-gray-900">{trip.owner_details.username} ({trip.owner_details.email})</dd>
              </div>
            )}
          </div>
           {error && <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md"><p className="text-red-700 font-medium">Trip Operation Error: {error}</p></div>}
        </div>

        {/* Map Display for Trip Destination and Activities */}
        {(trip.latitude && trip.longitude) || activities.some(act => act.latitude && act.longitude) ? (
          <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/60 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-3 text-blue-500" />
              Trip Itinerary Map
            </h3>
            <MapDisplay 
              centerLatitude={trip.latitude}
              centerLongitude={trip.longitude}
              markers={[
                ...(trip.latitude && trip.longitude ? [{
                  latitude: trip.latitude,
                  longitude: trip.longitude,
                  popupText: `Main Destination: ${trip.destination || trip.nom}`
                }] : []),
                ...activities
                  .filter(act => act.latitude != null && act.longitude != null)
                  .map(act => ({
                    latitude: act.latitude,
                    longitude: act.longitude,
                    popupText: `Activity: ${act.nom}${act.location_name ? ` (${act.location_name})` : ''}`
                  }))
              ]}
              mapHeight="400px"
            />
          </div>
        ) : (
          <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/60 p-6 text-center">
            <FaMapMarkerAlt className="mr-3 text-blue-500 inline-block mb-2" size={24}/>
            <p className="text-gray-600">No location data available to display a map for this trip or its activities.</p>
          </div>
        )}

        {/* Activities Section */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-gray-800">Activities ({activities.length})</h2>
            <Link
              to={`/trips/${tripId}/activities/new`}
              className="bg-gradient-to-r from-green-500 to-lime-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-green-600 hover:to-lime-600 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              <span>Add New Activity</span>
            </Link>
          </div>

          {activityError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow">
              <div className="text-red-700 font-medium">Activity Error: {activityError}</div>
            </div>
          )}

          {loadingActivities ? (
            <p className="text-gray-500 py-4 italic text-center">Loading activities...</p>
          ) : activities.length === 0 ? (
            <div className="text-center py-10 bg-gray-50/70 rounded-xl border border-gray-200/80 shadow-sm">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              <p className="text-gray-700 text-lg font-semibold mb-2">No activities planned yet.</p>
              <p className="text-gray-500 mb-4">Get started by adding an activity to your trip!</p>
            </div>
          ) : (
            <div className="space-y-5">
              {activities.map((activity) => (
                <div key={activity.id} className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-gray-800">{activity.nom}</h3>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{activity.description || "No description provided."}</p>
                      </div>
                      <div className="flex-shrink-0 mt-3 sm:mt-0">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            activity.terminee
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {activity.terminee ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200/80 flex flex-col sm:flex-row justify-end items-center gap-3">
                      <button
                        onClick={() => handleToggleTerminee(activity.id, activity.terminee)}
                        className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1.5 shadow-sm hover:shadow-md transform hover:scale-105 ${
                          activity.terminee
                            ? 'bg-yellow-400 hover:bg-yellow-500 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {activity.terminee ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        )}
                        <span>{activity.terminee ? 'Mark Pending' : 'Mark Completed'}</span>
                      </button>
                      <Link
                        to={`/trips/${tripId}/activities/${activity.id}/edit`}
                        className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1.5 shadow-sm hover:shadow-md transform hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1.5 shadow-sm hover:shadow-md transform hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back to Trips Link */}
        <div className="mt-10 text-center">
          <Link
            to="/trips"
            className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors inline-flex items-center space-x-1.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span>Back to All My Trips</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TripDetailPage;