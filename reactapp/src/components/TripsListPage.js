import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../api';
import debounce from 'lodash.debounce'; // For debouncing search input
import Navbar from './Navbar';

const TripsListPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // State for the search term
  const [startDate, setStartDate] = useState(''); // State for start date
  const [endDate, setEndDate] = useState(''); // State for end date
  const [tripType, setTripType] = useState('all'); // State for trip type, default 'all'

  const tripTypeOptions = [ // Define trip type options based on the backend model
    { value: 'all', label: 'All Types' },
    { value: 'Solo', label: 'Solo' },
    { value: 'Family', label: 'Family' },
    { value: 'Business', label: 'Business' },
    { value: 'Backpacker', label: 'Backpacker' },
    { value: 'Other', label: 'Other' },
  ];

  // Debounced fetch function for trips
  const debouncedFetchTrips = useCallback(
    debounce(async (term, sDate, eDate, tType) => {
      try {
        setLoading(true);
        setError('');
        const data = await apiService.getTrips(term, sDate, eDate, tType); // Pass all filters
        setTrips(data);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to fetch trips. Please try again.');
        setTrips([]); // Clear trips on error
      } finally {
        setLoading(false);
      }
    }, 500), // 500ms debounce delay
    [] // Empty dependency array for useCallback
  );

  useEffect(() => {
    // Call debounced fetch on initial load and when searchTerm or dates change
    debouncedFetchTrips(searchTerm, startDate, endDate, tripType);
    // Cleanup function to cancel any pending debounced calls if component unmounts
    return () => {
      debouncedFetchTrips.cancel();
    };
  }, [searchTerm, startDate, endDate, tripType, debouncedFetchTrips]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const handleTripTypeChange = (event) => {
    setTripType(event.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setTripType('all'); // Reset trip type to 'all'
  };

  if (loading && trips.length === 0) { // Show full page loader only if trips are empty initially
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading trips...</p>
        </div>
      </div>
    );
  }

  if (error && trips.length === 0) { // Show full page error only if trips are empty initially
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
              <h3 className="text-md font-semibold text-red-700">Failed to load trips</h3>
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
            <h1 className="text-3xl font-bold text-gray-800">My Trips</h1>
            <Link
              to="/trips/new"
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New Trip</span>
            </Link>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-2 space-y-4">
            {/* Text Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="searchTrips"
                id="searchTrips"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-150"
                placeholder="Search trips by name or destination..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Date and Type Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input 
                  type="date" 
                  name="startDate"
                  id="startDate"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="block w-full py-2.5 px-3 border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-150"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input 
                  type="date" 
                  name="endDate"
                  id="endDate"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="block w-full py-2.5 px-3 border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-150"
                />
              </div>
              <div>
                <label htmlFor="tripType" className="block text-sm font-medium text-gray-700 mb-1">Trip Type</label>
                <select
                  id="tripType"
                  name="tripType"
                  value={tripType}
                  onChange={handleTripTypeChange}
                  className="block w-full py-2.5 pl-3 pr-10 border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-150"
                >
                  {tripTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || startDate || endDate || tripType !== 'all') && (
                <button 
                    onClick={clearFilters}
                    className="w-full md:w-auto text-sm text-blue-600 hover:text-blue-800 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors duration-150 flex items-center justify-center space-x-1.5"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Clear All Filters</span>
                </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Inline loading indicator (spinner) when trips are already present but reloading */}
        {loading && trips.length > 0 && (
            <div className="flex justify-center items-center py-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Searching...</span>
            </div>
        )}

        {/* Error display when trips might already be visible */}
        {error && trips.length > 0 && (
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

        {!loading && trips.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200/70 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg className="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 13.5h-6" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm || startDate || endDate || tripType !== 'all' ? `No trips found for current filters` : 'No trips planned yet'}
            </h3>
            <p className="text-gray-500 mb-6">
                {searchTerm || startDate || endDate || tripType !== 'all' ? 'Try adjusting your search or date filters, or clear them to see all trips.' : 'Start planning your next adventure!'}
            </p>
            {(searchTerm || startDate || endDate || tripType !== 'all') ? (
                <button 
                    onClick={clearFilters} 
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-150 shadow-md"
                >
                    Clear Filters
                </button>
            ) : (
                <Link
                  to="/trips/new"
                  className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors duration-150 shadow-md"
                >
                  Create First Trip
                </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, index) => (
              <Link
                key={trip.id}
                to={`/trips/${trip.id}`}
                className="block group transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden h-full flex flex-col group-hover:shadow-xl transition-shadow duration-300">
                  <div className="p-6 flex-grow">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                          {trip.destination?.[0]?.toUpperCase() || 'T'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-green-600 transition-colors">
                            {trip.nom || `Trip ${index + 1}`}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {trip.trip_type || "General Trip"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-md font-medium text-gray-700 mb-1">
                        Destination: <span className="font-bold text-green-700 group-hover:text-green-500 transition-colors">{trip.destination || "N/A"}</span>
                      </h2>
                      <p className="text-sm text-gray-500">
                        {new Date(trip.start_date).toLocaleDateString()} &rarr; {new Date(trip.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {/* Optional: Add a footer or an image preview if trips have images */}
                  {/* <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-200/60">
                    <span className="text-xs text-gray-500">View Details &rarr;</span>
                  </div> */}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>

  );
};

export default TripsListPage;
