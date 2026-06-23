import axios from "axios";
import { getTokenCookie } from "../cookies";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";

// Public API instance (no authentication required)
export const publicApiInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Protected API instance (authentication required)
export const protectedApiInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

protectedApiInstance.interceptors.request.use(async (config) => {
    const token = await getTokenCookie();
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Legacy instance for backward compatibility
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(async (config) => {
    const token = await getTokenCookie();
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;