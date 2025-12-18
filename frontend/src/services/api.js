import axios from "axios";
/**
 * Axios defaults
 */
const { VITE_BACKEND_URL } = import.meta.env;
axios.defaults.baseURL = VITE_BACKEND_URL || "http://localhost:6000/api";

// Headers
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common.Accept = "application/json";


export default axios;
