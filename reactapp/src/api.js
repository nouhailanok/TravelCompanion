// reactapp/src/api.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000', // Your Django backend URL
    headers: {
        'Content-Type': 'application/json', // Default, can be overridden
    },
});

// Interceptor to add the auth token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Define and Export Specific Service Functions ---
export const apiService = {
    // Authentication (assuming you have these in AuthContext or will add them here)
    login: async (email, password) => {
        // Path confirmed from account/urls.py and myapp/urls.py
        const response = await apiClient.post('/connect/api/token/login/', { email, password });
        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
            if (response.data.user_id) {
                localStorage.setItem('userId', response.data.user_id);
            }
        }
        return response.data;
    },

    register: async (username, email, password) => {
        // Use your actual register path and payload structure
        const response = await apiClient.post('/connect/api/register/', { name: username, email, password });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        // apiClient.post('/connect/logout/'); // Optional: if you have a backend logout
    },

    getUser: async () => {
        // This path needs confirmation. Assuming /connect/api/users/me/ for now.
        // If your UserViewSet doesn't have a 'me' endpoint, this will need adjustment
        // or you need to add one to your UserViewSet.
        const response = await apiClient.get('/connect/api/users/me/');
        return response.data;
    },

    // Trips (add your trip methods here if they are not elsewhere)
    getTrips: async (searchTerm = null, startDate = null, endDate = null, tripType = null) => {
        let url = '/api/trips/';
        const params = new URLSearchParams();
        if (searchTerm && searchTerm.trim() !== '') {
            params.append('search', searchTerm.trim());
        }
        if (startDate) {
            params.append('start_date', startDate); // Assuming YYYY-MM-DD format
        }
        if (endDate) {
            params.append('end_date', endDate); // Assuming YYYY-MM-DD format
        }
        if (tripType && tripType.toLowerCase() !== 'all') { // Add trip_type to params if not 'all'
            params.append('trip_type', tripType);
        }
        
        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        const response = await apiClient.get(url);
        return response.data;
    },
    createTrip: async (tripData) => {
        const response = await apiClient.post('/api/trips/', tripData);
        return response.data;
    },
    getTripDetails: async (tripId) => {
        const response = await apiClient.get(`/api/trips/${tripId}/`);
        return response.data;
    },
    updateTrip: async (tripId, tripData) => {
        const response = await apiClient.put(`/api/trips/${tripId}/`, tripData);
        return response.data;
    },
    deleteTrip: async (tripId) => {
        await apiClient.delete(`/api/trips/${tripId}/`);
    },


    // Activities (add your activity methods here)
    getActivitiesForTrip: async (tripId) => {
        const response = await apiClient.get(`/api/activites/?trip=${tripId}`); // Adjust as needed
        return response.data;
    },
    createActivity: async (activityData) => {
        // Ensure this path EXACTLY matches your Django endpoint for creating activities
        const response = await apiClient.post('/api/activites/', activityData); // Check this line very carefully
        return response.data;
    },
    updateActivity: async (activityId, activityData) => {
        const response = await apiClient.patch(`/api/activites/${activityId}/`, activityData);
        return response.data;
    },
    deleteActivity: async (activityId) => {
        await apiClient.delete(`/api/activites/${activityId}/`);
    },
    getSingleActivityDetails: async (activityId) => {
        // This endpoint should fetch a single activity by its ID.
        // Confirm the path, likely /api/activities/{activityId}/
        const response = await apiClient.get(`/api/activites/${activityId}/`);
        return response.data;
    },


    // --- Methods for Posts ---
    getPosts: async (searchTerm = null, startDate = null, endDate = null) => {
        let url = '/api/posts/';
        const params = new URLSearchParams();

        if (searchTerm && searchTerm.trim() !== '') {
            params.append('search', searchTerm.trim());
        }
        if (startDate) {
            params.append('start_date', startDate); // Assuming YYYY-MM-DD format
        }
        if (endDate) {
            params.append('end_date', endDate); // Assuming YYYY-MM-DD format
        }
        
        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        const response = await apiClient.get(url);
        return response.data;
    },

    createPost: async (postData) => { // postData here is expected to be FormData
        // TODO: Confirm this Django endpoint path
        const response = await apiClient.post('/api/posts/', postData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Essential for file uploads
            },
        });
        return response.data;
    },

    createComment: async (commentData) => {
        // commentData should be an object like { text: "...", post_id: ... }
        // Endpoint confirmed as /api/comments/
        const response = await apiClient.post('/api/comments/', commentData);
        return response.data; // The newly created comment object is usually returned
    },

    deleteComment: async (commentId) => {
        // Endpoint confirmed as DELETE /api/comments/{commentId}/
        const response = await apiClient.delete(`/api/comments/${commentId}/`);
        return response.data; // Or response.status if no data is returned on 204 No Content
    },

    getPostDetails: async (postId) => {
        // Confirm the path, likely /api/posts/{postId}/
        const response = await apiClient.get(`/api/posts/${postId}/`);
        return response.data;
    },
    // Add getPostDetails, updatePost, deletePost later if needed

    updatePost: async (postId, postData) => {
        // postData is expected to be an instance of FormData,
        // especially if an image file might be included.
        // The backend (PostSerializer with ModelViewSet) handles PUT/PATCH with FormData.
        const response = await apiClient.put(`/api/posts/${postId}/`, postData, {
            headers: {
                // Axios should set 'Content-Type': 'multipart/form-data' automatically
                // when the data is FormData. If you encounter issues, you might need to set it explicitly.
                // However, it's generally better to let Axios handle it for FormData.
                'Content-Type': 'multipart/form-data', // Explicitly set for file uploads
            },
        });
        return response.data;
    },

    deletePost: async (postId) => {
        // DELETE request to /api/posts/{postId}/
        // The PostViewSet on the backend handles this.
        const response = await apiClient.delete(`/api/posts/${postId}/`);
        // DELETE typically returns 204 No Content, so response.data might be empty.
        // Returning the status can be useful to confirm success.
        return { status: response.status };
    },

    likePost: async (postId) => {
        // Frontend will send the ID of the post to be liked.
        // Backend LikeSerializer expects a field named 'post' with this ID.
        const response = await apiClient.post('/api/likes/', { post: postId });
        return response.data; // Returns the created Like object (which includes its own ID)
    },

    unlikePost: async (likeId) => {
        // Frontend will send the ID of the specific 'Like' instance to be deleted.
        // This corresponds to DELETE /api/likes/{likeId}/
        const response = await apiClient.delete(`/api/likes/${likeId}/`);
        // DELETE typically returns 204 No Content, so response.data might be empty.
        // Returning the status can be useful to confirm success.
        return { status: response.status };
    },



};

// You can still export apiClient if other parts of your code use it directly,
// but it's generally better to use the methods in apiService.
// For now, let's remove the default export to avoid confusion if nothing else is using it.
// export default apiClient; // Remove or comment out if not strictly needed elsewhere