import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8081', 
    timeout: 5000,                    
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default axiosClient;