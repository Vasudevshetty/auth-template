import axios from "axios";

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1", // Match your backend API prefix
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important: This enables sending cookies with requests
});

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't already tried refreshing
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using the refresh endpoint
        // The cookie will be sent automatically due to withCredentials: true
        const response = await axios.post(
          "http://localhost:3000/api/v1/auth/refresh-token",
          {},
          { withCredentials: true }
        );

        if (response.data.success) {
          // Token has been refreshed and new cookies are set
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
