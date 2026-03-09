// reactapp/src/components/EditPostPage.js
import React, { useState, useEffect } from 'react';
import { apiService } from '../api';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const EditPostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [addPlace, setAddPlace] = useState('');
  const [originalAddPlace, setOriginalAddPlace] = useState(''); // For subtitle
  const [description, setDescription] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postOwnerId, setPostOwnerId] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError('');
        const postData = await apiService.getPostDetails(postId);
        setAddPlace(postData.Add_Place);
        setOriginalAddPlace(postData.Add_Place); // Store original name
        setDescription(postData.Description);
        setCurrentImage(postData.image);
        setPostOwnerId(postData.owner_details?.id || postData.owner);
        if (postData.image) {
            setImagePreview(postData.image); // Set preview to current image initially
        }
      } catch (err) {
        console.error('Failed to fetch post for editing:', err);
        const status = err.response?.status;
        if (status === 404) {
            setError('Post not found. It might have been deleted.');
        } else if (status === 403) {
            setError('You are not authorized to view this post for editing.');
        } else {
            setError(err.response?.data?.detail || 'Failed to load post data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Authorization check for editing, performed after data load
  useEffect(() => {
    if (!loading && user && postOwnerId && user.id !== postOwnerId && !error) { // only set auth error if no other critical error
      setError('You are not authorized to edit this post.');
    }
  }, [loading, user, postOwnerId, navigate, error]);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setCurrentImage(null); // Clear current image if new one is selected
      setImagePreview(URL.createObjectURL(file));
    } else {
      // If cleared, and there was a new file selected, revert to original or nothing
      setNewImageFile(null);
      // If there was an original image, show it again, otherwise clear preview
      const originalImage = async () => await apiService.getPostDetails(postId).then(data => data.image);
      originalImage().then(imgUrl => {
          if (imgUrl) {
              setCurrentImage(imgUrl);
              setImagePreview(imgUrl);
          } else {
              setCurrentImage(null);
              setImagePreview('');
          }
      });
    }
  };

  const handleRemoveCurrentImage = () => {
    setCurrentImage(null); // Visually remove
    setNewImageFile(null); // Ensure no old "new" file is lingering
    setImagePreview('');   // Clear preview
    // To truly delete, backend must handle `image: null` or `image: ''` on submit.
    // We will send `image: null` if `currentImage` is null and `newImageFile` is null.
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user && postOwnerId && user.id !== postOwnerId) {
        setSubmitError('Authorization error: You cannot submit changes for this post.');
        return;
    }

    setSubmitError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    if (!addPlace.trim() || !description.trim()) {
      setSubmitError('Place name and description cannot be empty.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('Add_Place', addPlace.trim());
    formData.append('Description', description.trim());
    
    if (newImageFile) {
      formData.append('image', newImageFile);
    } else if (currentImage === null && !newImageFile) { 
      // If currentImage was explicitly removed (set to null by handleRemoveCurrentImage) 
      // and no new image is selected, send empty string to tell backend to clear image.
      // Your backend needs to be set up to interpret an empty string for an ImageField as "clear".
      // For Django, this usually means setting the field to null.
      // If ImageField(null=True, blank=True)
      formData.append('image', ''); 
    }
    // If newImageFile is null AND currentImage has a URL, no 'image' field is appended to formData.
    // This tells the backend to make no changes to the image.

    try {
      await apiService.updatePost(postId, formData);
      setSuccessMessage('Post updated successfully! Redirecting...');
      // Fetch updated post data to refresh originalAddPlace and image previews
      const postData = await apiService.getPostDetails(postId);
      setOriginalAddPlace(postData.Add_Place);
      setCurrentImage(postData.image);
      if(postData.image) setImagePreview(postData.image); else setImagePreview('');
      setNewImageFile(null); // Clear the new file state

      setTimeout(() => {
        navigate(`/posts/${postId}`);
      }, 2000);
    } catch (err) {
      console.error('Failed to update post:', err);
      const errorData = err.response?.data;
      let errorMsg = 'Failed to update post: ';
      if (typeof errorData === 'string') {
        errorMsg += errorData;
      } else if (errorData) {
        errorMsg += Object.entries(errorData)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ');
      } else {
        errorMsg = 'An unexpected error occurred. Please try again.';
      }
      setSubmitError(errorMsg.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading post editor...</p>
        </div>
      </div>
    );
  }

  if (error) { // Covers fetch errors and auth errors set in useEffect
    return (
      <div className="min-h-screen bg-[#fffaf3] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-md w-full">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Error Loading Post</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            to={user && postOwnerId && user.id === postOwnerId ? `/posts/${postId}` : "/posts"}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-150"
          >
            {user && postOwnerId && user.id === postOwnerId ? "Back to Post Details" : "Back to Posts"}
          </Link>
        </div>
      </div>
    );
  }
  
  // This specific authorization check for UI rendering might be redundant if `error` state already handles it.
  // However, keeping it ensures the form is not displayed if user is not owner.
  if (!user || (postOwnerId && user.id !== postOwnerId)) {
    return (
      <div className="min-h-screen bg-[#fffaf3] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-md w-full">
          <svg className="w-16 h-16 text-yellow-500 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-8">You are not authorized to edit this post.</p>
          <Link
            to={`/posts/${postId}`}
            className="px-6 py-2.5 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-150"
          >
            View Post
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-[#fffaf3] py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight">
                Edit Post
            </h2>
            {originalAddPlace && <p className="mt-2 text-lg text-gray-500">Editing: <span className="font-semibold">{originalAddPlace}</span></p>}
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
                required
                />
            </div>
            <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                </label>
                <div className="mt-2 space-y-3">
                    {imagePreview && (
                         <div className="p-3 border border-gray-200 rounded-lg bg-gray-50/50 inline-block shadow-sm">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                {newImageFile ? "New Image Preview:" : "Current Image:"}
                            </p>
                            <img 
                                src={imagePreview} 
                                alt={newImageFile ? "New preview" : "Current post image"} 
                                className="max-w-xs max-h-48 object-contain rounded-md border border-gray-300" 
                            />
                        </div>
                    )}
                    {!imagePreview && !currentImage && (
                        <p className="text-sm text-gray-500">No image currently uploaded for this post.</p>
                    )}

                    <input
                        type="file"
                        id="image"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border border-gray-300 rounded-lg bg-white/70 p-2.5"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {currentImage && !newImageFile && ( // Show remove only if there's a current image and no new one selected
                        <button 
                            type="button" 
                            onClick={handleRemoveCurrentImage}
                            className="px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            Remove Current Image
                        </button>
                    )}
                </div>
            </div>

            {submitError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm0-4a1 1 0 112 0v1a1 1 0 11-2 0V7z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-700">{submitError}</p>
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
                    to={postId ? `/posts/${postId}` : "/posts"}
                    className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-150 text-center shadow-sm"
                >
                    Cancel
                </Link>
                <button 
                    type="submit" 
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2 -ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Update Post
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
};

export default EditPostPage;