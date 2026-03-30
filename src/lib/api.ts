import axios from "axios";

// Standardize baseURL to the server root
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
