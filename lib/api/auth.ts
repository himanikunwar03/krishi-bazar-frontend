import { publicApiInstance, protectedApiInstance } from "./axios-instance";
import { API } from "./endpoints";

// Public endpoints (no authentication required)
export const register = async (data: any) => {
    try {
        console.log("Making API call to:", API.AUTH.REGISTER);
        console.log("Request data:", data);
        const response =
            await publicApiInstance.post(API.AUTH.REGISTER, data);
        console.log("API response:", response.data);
        return response.data;
    } catch (error: Error | any) {
        console.error("API error:", error);
        console.error("Error response:", error?.response?.data);
        throw new Error(error?.response?.data?.message
            || 'Registration failed');
    }
}

export const login = async (data: any) => {
    try {
        const response =
            await publicApiInstance.post(API.AUTH.LOGIN, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message
            || 'Login failed');
    }
}

// Protected endpoints (authentication required)
export const whoami = async () => {
    try {
        const response =
            await protectedApiInstance.get(API.AUTH.WHOAMI);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message
            || 'Failed to fetch user details');
    }
}

export const updateProfile = async (data: any) => {
    try {
        console.log("updateProfile called with FormData:");
        data.forEach((value: any, key: string) => {
            console.log(`${key}:`, value);
        });
        
        const response = await protectedApiInstance.put(API.AUTH.UPDATE, data,  { 
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log("updateProfile API response:", response.data);
        return response.data;
    } catch (error: Error | any) {
        console.error("updateProfile error:", error);
        console.error("Error response:", error?.response?.data);
        throw new Error(error?.response?.data?.message
            || 'Failed to update profile');
    }
}

export const updatePassword = async (data: any) => {
    try {
        const response = await protectedApiInstance.put(API.AUTH.UPDATE_PASSWORD, data);
        return response.data;
    }
    catch (error: Error | any) {
        throw new Error(error?.response?.data?.message
            || 'Failed to update password');
    }
}