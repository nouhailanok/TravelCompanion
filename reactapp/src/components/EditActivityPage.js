// reactapp/src/components/EditActivityPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiService } from '../api'; // <--- CORRECTED IMPORT
import Navbar from './Navbar';

const EditActivityPage = () => {
  const { tripId, activityId } = useParams(); // Get both tripId and activityId
  const navigate = useNavigate();

  const [originalNom, setOriginalNom] = useState(''); // To display in title while editing nom
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState(''); // New state for location name
  const [terminee, setTerminee] = useState(false); // Assuming 'terminee' is a boolean
  const [tripName, setTripName] = useState('');
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // For initial data fetch error
  const [submitError, setSubmitError] = useState(''); // For form submission error
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchActivityData = async () => {
      if (!activityId) {
        setError('Activity ID is missing.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const activityData = await apiService.getSingleActivityDetails(activityId);
        setNom(activityData.nom);
        setOriginalNom(activityData.nom); // Store original name for title
        setDescription(activityData.description || ''); // Ensure description is not undefined
        setTerminee(activityData.terminee || false); // Ensure terminee is not undefined
        setLocationName(activityData.location_name || ''); // Set locationName
        setTripName(activityData.Trip?.nom || ''); // Fetch trip name for display
        setError('');
      } catch (err) {
        console.error('Failed to fetch activity data for editing:', err);
        if (err.response && err.response.status === 404) {
            setError('Activity not found. It may have been deleted.');
        } else if (err.response && err.response.status === 403) {
            setError('You do not have permission to edit this activity.');
        } else {
            setError(err.response?.data?.detail || 'Failed to load activity data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchActivityData();
  }, [activityId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMessage('');

    if (!nom.trim()) {
      setSubmitError('Activity name is required.');
      return;
    }
    setIsSubmitting(true);

    const updatedActivityData = {
      nom: nom.trim(),
      description: description.trim(),
      terminee,
      location_name: locationName.trim(), // Add location_name to payload
      Trip: parseInt(tripId, 10), // Ensure Trip ID is included for the PATCH/PUT request
    };

    try {
      await apiService.updateActivity(activityId, updatedActivityData);
      setSuccessMessage('Activity updated successfully! Redirecting back to trip details...');
      setOriginalNom(nom.trim()); // Update originalNom to the new nom after successful save
      setTimeout(() => {
        navigate(`/trips/${tripId}`);
      }, 2000); // Increased timeout for message visibility
    } catch (err) {
      console.error('Failed to update activity:', err);
      if (err.response && err.response.data) {
        const backendErrors = err.response.data;
        let errorMessages = [];
        if (typeof backendErrors === 'string') {
            errorMessages.push(backendErrors);
        } else if (typeof backendErrors === 'object') {
            for (const key in backendErrors) {
                if (Array.isArray(backendErrors[key])) {
                    errorMessages.push(`${key}: ${backendErrors[key].join(', ')}`);
                } else {
                    errorMessages.push(`${key}: ${backendErrors[key]}`);
                }
            }
        }
        setSubmitError(errorMessages.length > 0 ? errorMessages.join('; ') : 'An unknown error occurred during update.');
      } else {
        setSubmitError('Failed to update activity. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading activity data for editing...</p>
        </div>
      </div>
    );
  }

  if (error) { // Error during initial data fetch
    return (
      <div className="min-h-screen bg-[#fffaf3] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-lg w-full">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Error Loading Activity</h2>
            <p className="text-red-600 bg-red-50 p-3 rounded-md mb-6">{error}</p>
            <Link
                to={`/trips/${tripId}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg inline-flex items-center space-x-2"
            >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                <span>Back to Trip Details</span>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-[#fffaf3] py-8 sm:py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                Edit Activity
            </h1>
            <p className="text-gray-600 mt-2 text-lg truncate">
                {originalNom || 'Loading activity name...'}
            </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200/70 p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nom" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Activity Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nom"
                className="block w-full px-4 py-2.5 text-gray-700 bg-white bg-opacity-70 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                className="block w-full px-4 py-2.5 text-gray-700 bg-white bg-opacity-70 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
              />
            </div>
            
            <div>
              <label htmlFor="locationName" className="block text-sm font-medium text-gray-700">
                Location Name (Optional)
              </label>
              <input
                type="text"
                name="locationName"
                id="locationName"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white/90 placeholder-gray-400"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g., Louvre Museum or specific address"
              />
            </div>

            <div className="flex items-center">
                <input
                    id="terminee"
                    name="terminee"
                    type="checkbox"
                    checked={terminee}
                    onChange={(e) => setTerminee(e.target.checked)}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shadow-sm bg-white bg-opacity-70"
                />
                <label htmlFor="terminee" className="ml-2.5 block text-sm font-semibold text-gray-700">
                    Mark as Completed
                </label>
            </div>

            {submitError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow" role="alert">
                <p className="font-medium">Error Updating:</p>
                <p>{submitError}</p>
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow" role="alert">
                <p className="font-medium">Success:</p>
                <p>{successMessage}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row-reverse sm:items-center sm:justify-start gap-3 pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                <span>{isSubmitting ? 'Updating Activity...' : 'Update Activity'}</span>
              </button>
              <Link
                to={`/trips/${tripId}`}
                className="w-full sm:w-auto text-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md transform hover:scale-105"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default EditActivityPage;