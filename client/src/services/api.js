import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true, // Crucial for cookie transmission
});

// Response interceptor to format errors cleanly
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Standardize error formats from server
    const message = error.response?.data?.message || "An unexpected error occurred.";
    const errors = error.response?.data?.errors || [];
    const customError = new Error(message);
    customError.statusCode = error.response?.status || 500;
    customError.errors = errors;
    return Promise.reject(customError);
  }
);

export default API;
