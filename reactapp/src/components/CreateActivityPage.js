// reactapp/src/components/CreateActivityPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiService } from '../api';
import Navbar from './Navbar';

const CreateActivityPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tripName, setTripName] = useState('');
  const [loadingTripName, setLoadingTripName] = useState(true);

  useEffect(() => {
    if (tripId) {
      setLoadingTripName(true);
      apiService.getTripDetails(tripId)
        .then(data => setTripName(data.nom))
        .catch(err => {
            console.error("Failed to fetch trip name for context", err);
            setTripName(''); // Clear or set to a default if fetch fails
        })
        .finally(() => setLoadingTripName(false));
    }
  }, [tripId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccessMessage('');

    if (!nom.trim()) {
      setError('Activity name is required.');
      return;
    }
    setIsSubmitting(true);

    const activityData = {
        nom: nom.trim(),
        description: description.trim(),
        location_name: locationName.trim(),
        trip_id: parseInt(tripId, 10),
    };

    try {
      await apiService.createActivity(activityData);
      setSuccessMessage('Activity created successfully! Redirecting back to trip details...');
      setNom('');
      setDescription('');
      setLocationName('');
      setTimeout(() => {
        navigate(`/trips/${tripId}`);
      }, 2000); // Increased timeout slightly for message visibility
    } catch (err) {
      console.error('Failed to create activity:', err);
      if (err.response && err.response.data) {
        // Attempt to create a more user-friendly message from backend errors
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
        setError(errorMessages.length > 0 ? errorMessages.join('; ') : 'An unknown error occurred.');
      } else {
        setError('Failed to create activity. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-[#fffaf3] py-8 sm:py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                Add New Activity
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
                For Trip: {loadingTripName ? 'Loading trip name...' : (tripName || <span className="italic">Unnamed Trip (ID: {tripId})</span>)}
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
                placeholder="e.g., Visit the Eiffel Tower"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white/90 placeholder-gray-400"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Visited the main hall, saw ancient artifacts..."
                required
              ></textarea>
            </div>

            <div>
              <label htmlFor="locationName" className="block text-sm font-medium text-gray-700">
                Location Name (Optional)
              </label>
              <input
                type="text"
                name="locationName"
                id="locationName"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white/90 placeholder-gray-400"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g., Eiffel Tower, Paris or specific address"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow" role="alert">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
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
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-lime-600 hover:from-green-600 hover:to-lime-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                <span>{isSubmitting ? 'Creating Activity...' : 'Create Activity'}</span>
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

export default CreateActivityPage;