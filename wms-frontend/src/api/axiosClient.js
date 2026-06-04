import axios from 'axios';

// 1. Instantiate the centralized network client configuration
const axiosClient = axios.create({
    baseURL: 'http://localhost:8081', 
    timeout: 5000,                    
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// 2. Add a Request Interceptor to catch all outbound traffic
axiosClient.interceptors.request.use(
    (config) => {
        // Retrieve the secure JWT token string from the browser's local storage
        const token = localStorage.getItem('token');
        
        // If a token exists, inject it into the HTTP Authorization header
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        // Handle client-side request preparation errors gracefully
        return Promise.reject(error);
    }
);

export default axiosClient;