// reactapp/src/components/EditTripPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiService } from '../api'; // <--- CORRECTED IMPORT
import Navbar from './Navbar';

const EditTripPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [originalNom, setOriginalNom] = useState('');
  const [nom, setNom] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tripType, setTripType] = useState(''); // Initialize empty, will be set from fetched data
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // For initial data fetch error
  const [submitError, setSubmitError] = useState(''); // For form submission error
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure this matches your Django model's choices for 'trip_type' or 'type_voyage'
  const tripTypeChoices = ['Solo', 'Family', 'Friends', 'Couple', 'Business', 'Backpacker', 'Luxury', 'Adventure', 'Relaxation', 'Cultural', 'Other']; 

  useEffect(() => {
    const fetchTripData = async () => {
      if (!tripId) {
        setError('Trip ID is missing.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const tripData = await apiService.getTripDetails(tripId);
        setNom(tripData.nom);
        setOriginalNom(tripData.nom);
        setDestination(tripData.destination || '');
        // Dates are tricky; ensure they are in YYYY-MM-DD for input type=date
        setStartDate(tripData.start_date ? new Date(tripData.start_date).toISOString().split('T')[0] : '');
        setEndDate(tripData.end_date ? new Date(tripData.end_date).toISOString().split('T')[0] : '');
        setTripType(tripData.trip_type || tripData.type_voyage || 'Solo'); // Default to 'Solo' if not set
        setError('');
      } catch (err) {
        console.error('Failed to fetch trip data for editing:', err);
         if (err.response && err.response.status === 404) {
            setError('Trip not found. It may have been deleted.');
        } else if (err.response && err.response.status === 403) {
            setError('You do not have permission to edit this trip.');
        } else {
            setError(err.response?.data?.detail || 'Failed to load trip data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTripData();
  }, [tripId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMessage('');

    if (!nom.trim() || !destination.trim() || !startDate || !endDate || !tripType) {
      setSubmitError('Please fill in all required fields correctly.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        setSubmitError('Start date cannot be after end date.');
        return;
    }
    setIsSubmitting(true);

    const updatedTripData = {
      nom: nom.trim(),
      destination: destination.trim(),
      start_date: startDate,
      end_date: endDate,
      trip_type: tripType,
    };

    try {
      await apiService.updateTrip(tripId, updatedTripData);
      setSuccessMessage('Trip updated successfully! Redirecting back to trip details...');
      setOriginalNom(nom.trim()); // Update originalNom after successful save
      setTimeout(() => {
        navigate(`/trips/${tripId}`);
      }, 2000); // Increased timeout
    } catch (err) {
      console.error('Failed to update trip:', err);
      if (err.response && err.response.data) {
        const backendErrors = err.response.data;
        let errorMessages = [];
        if (typeof backendErrors === 'string') {
            errorMessages.push(backendErrors);
        } else if (typeof backendErrors === 'object') {
            for (const key in backendErrors) {
                if (Array.isArray(backendErrors[key])) {
                    errorMessages.push(`${key.replace('_', ' ')}: ${backendErrors[key].join(', ')}`);
                } else {
                    errorMessages.push(`${key.replace('_', ' ')}: ${backendErrors[key]}`);
                }
            }
        }
        setSubmitError(errorMessages.length > 0 ? errorMessages.join('; ') : 'An unknown error occurred during update.');
      } else {
        setSubmitError('Failed to update trip. Please check your connection and try again.');
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
          <p className="text-gray-600 font-medium">Loading trip data for editing...</p>
        </div>
      </div>
    );
  }

  if (error) { // Error during initial data fetch
    return (
      <div className="min-h-screen bg-[#fffaf3] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-lg w-full">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Error Loading Trip Data</h2>
            <p className="text-red-600 bg-red-50 p-3 rounded-md mb-6">{error}</p>
            <Link
                to={tripId ? `/trips/${tripId}` : '/trips'} // Link to specific trip if ID exists, else to trips list
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
                Edit Your Trip
            </h1>
            <p className="text-gray-600 mt-2 text-lg truncate">
                {originalNom || 'Loading trip name...'}
            </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200/70 p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nom" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Trip Name <span className="text-red-500">*</span>
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
              <label htmlFor="destination" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Main Destination <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="destination"
                className="block w-full px-4 py-2.5 text-gray-700 bg-white bg-opacity-70 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="block w-full px-4 py-2.5 text-gray-700 bg-white bg-opacity-70 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="block w-full px-4 py-2.5 text-gray-700 bg-white bg-opacity-70 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="tripType" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Trip Type <span className="text-red-500">*</span>
              </label>
              <select
                id="tripType"
                className="block w-full px-4 py-2.5 text-gray-700 bg-white bg-opacity-70 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out appearance-none"
                value={tripType} // Ensure this is controlled
                onChange={(e) => setTripType(e.target.value)}
                required
              >
                {/* <option value="" disabled={tripType !== ''}>Select a trip type</option> */}
                {tripTypeChoices.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
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
                <span>{isSubmitting ? 'Updating Trip...' : 'Update Trip'}</span>
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

export default EditTripPage;