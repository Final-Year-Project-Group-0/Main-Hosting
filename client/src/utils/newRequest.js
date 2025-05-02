import axios from "axios";

const newRequest = axios.create({
  baseURL: "http://localhost:8800/api/",
  withCredentials: true,
});

// Add request interceptor for logging
newRequest.interceptors.request.use(
  function (config) {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  function (error) {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
newRequest.interceptors.response.use(
  function (response) {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  function (error) {
    console.error("Response error:", error);
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default newRequest;