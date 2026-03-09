// reactapp/src/components/CreatePostPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { apiService } from '../api'; // <--- CORRECTED IMPORT (or ensure this is correct)
import Navbar from './Navbar';

function CreatePostPage() {
    const [addPlace, setAddPlace] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null); // For file input
    const [imagePreview, setImagePreview] = useState(null); // For image preview

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file)); // Create a preview URL
        } else {
            setImage(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsSubmitting(true);

        if (!addPlace.trim() || !description.trim()) {
            setError('Place name and description are required.');
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append('Add_Place', addPlace.trim());
        formData.append('Description', description.trim());
        if (image) {
            formData.append('image', image);
        }

        try {
            await apiService.createPost(formData);
            setSuccessMessage('Post created successfully! Redirecting...');
            setAddPlace('');
            setDescription('');
            setImage(null);
            setImagePreview(null);
            setTimeout(() => {
                navigate('/posts');
            }, 2000);
        } catch (err) {
            console.error('Failed to create post:', err);
            if (err.response && err.response.data) {
                const backendErrors = err.response.data;
                let errorMsg = 'Failed to create post: ';
                for (const key in backendErrors) {
                  errorMsg += `${key}: ${Array.isArray(backendErrors[key]) ? backendErrors[key].join(', ') : backendErrors[key]} `;
                }
                setError(errorMsg.trim());
            } else {
                setError('Failed to create post. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
        <Navbar />
        <div className="min-h-screen bg-[#fffaf3] py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight">
                        Share Your Experience
                    </h2>
                    <p className="mt-2 text-md text-gray-600">Let others know about the amazing places you've visited!</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-200/70">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="addPlace" className="block text-sm font-medium text-gray-700 mb-1">
                                Place Name / Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="addPlace"
                                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400 bg-white/70 focus:bg-white transition-colors"
                                value={addPlace}
                                onChange={(e) => setAddPlace(e.target.value)}
                                placeholder="e.g., Eiffel Tower Visit, Parisian Cafe"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400 bg-white/70 focus:bg-white transition-colors min-h-[120px]"
                                rows="5"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Share your thoughts, tips, and highlights..."
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                                Image (Optional)
                            </label>
                            <input
                                type="file"
                                id="image"
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border border-gray-300 rounded-lg bg-white/70 p-2.5"
                                onChange={handleImageChange}
                                accept="image/*"
                            />
                            {imagePreview && (
                                <div className="mt-4 p-3 border border-gray-200 rounded-lg bg-gray-50/50 inline-block shadow-sm">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                                    <img src={imagePreview} alt="Preview" className="max-w-xs max-h-48 object-contain rounded-md border border-gray-300" />
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-md">
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
                        {successMessage && (
                             <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm3.707-9.293a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-700">{successMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0 pt-2">
                            <Link 
                                to="/posts" 
                                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-150 text-center shadow-sm"
                            >
                                Cancel
                            </Link>
                            <button 
                                type="submit" 
                                className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                      <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                      Create Post
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </>
    );
}

export default CreatePostPage;