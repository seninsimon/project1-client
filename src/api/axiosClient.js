import axios from 'axios';

// Create an Axios instance
const axiosClient = axios.create({
    baseURL: config.API_BASE_URL, // Replace with your API base URL
});
import config from '../../config';

// Request Interceptor
axiosClient.interceptors.request.use(
    (config) => {
      
        const token = localStorage.getItem("usertoken");
        const token2 = localStorage.getItem("authToken")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        else if(token2) {
            config.headers.Authorization = `Bearer ${token2}`;
        }
        return config;
    },
    (error) => {
        // Handle request errors
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle response errors
        console.error("Axios response error:", error.response || error.message);
        return Promise.reject(error);
    }
);

export default axiosClient;

// import axios from 'axios';
// import config from '../../config'; // Import config file

// // Create an Axios instance
// const axiosClient = axios.create({
//     baseURL: config.API_BASE_URL, // Use the base URL from the config
// });

// // Request Interceptor
// axiosClient.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem(config.TOKEN_KEY); // Use the key from the config
//         const token2 = localStorage.getItem(config.AUTH_TOKEN_KEY); // Use the second token key from the config
        
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         } else if (token2) {
//             config.headers.Authorization = `Bearer ${token2}`;
//         }
        
//         return config;
//     },
//     (error) => {
//         // Handle request errors
//         return Promise.reject(error);
//     }
// );

// // Response Interceptor
// axiosClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         // Handle response errors
//         console.error("Axios response error:", error.response || error.message);
//         return Promise.reject(error);
//     }
// );

// export default axiosClient;

