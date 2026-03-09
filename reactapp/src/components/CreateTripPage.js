// reactapp/src/components/CreateTripPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../api';
import Navbar from './Navbar';

const CreateTripPage = () => {
  const [nom, setNom] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tripType, setTripType] = useState('Solo');
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const tripTypeChoices = ['Solo', 'Family', 'Friends', 'Couple', 'Business', 'Backpacker', 'Luxury', 'Adventure', 'Relaxation', 'Cultural', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!nom.trim() || !destination.trim() || !startDate || !endDate || !tripType) {
      setError('Please fill in all required fields correctly.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        setError('Start date cannot be after end date.');
        return; // No setIsSubmitting(false) needed here as it's set in finally
    }
    setIsSubmitting(true);

    const tripData = {
      nom: nom.trim(),
      destination: destination.trim(),
      start_date: startDate,
      end_date: endDate,
      trip_type: tripType,
    };

    try {
      await apiService.createTrip(tripData);
      setSuccessMessage('Trip created successfully! Redirecting to your trips list...');
      setNom('');
      setDestination('');
      setStartDate('');
      setEndDate('');
      setTripType('Solo');
      setTimeout(() => {
        navigate('/trips'); 
      }, 2000); // Slightly longer for message visibility
    } catch (err) {
      console.error('Failed to create trip:', err);
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
        setError(errorMessages.length > 0 ? errorMessages.join('; ') : 'An unknown error occurred.');
      } else {
        setError('Failed to create trip. Please check your connection and try again.');
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
                Plan Your Next Adventure
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
                Fill in the details below to create your new trip.
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
                placeholder="e.g., Summer Vacation in Italy"
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
                placeholder="e.g., Rome, Italy"
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
                value={tripType}
                onChange={(e) => setTripType(e.target.value)}
                required
              >
                {/* <option value="" disabled>Select a trip type</option> // Consider if default 'Solo' is better UX */}
                {tripTypeChoices.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
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
                <span>{isSubmitting ? 'Creating Trip...' : 'Create Trip'}</span>
              </button>
              <Link
                to="/trips"
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

export default CreateTripPage;