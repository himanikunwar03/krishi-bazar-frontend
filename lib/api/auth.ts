import { publicApiInstance, protectedApiInstance } from "./axios-instance";
import { API } from "./endpoints";

// Public endpoints (no authentication required)
export const register = async (data: any) => {
    try {
        const response =
            await publicApiInstance.post(API.AUTH.REGISTER, data);
        return response.data;
    } catch (error: Error | any) {
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
        const response = await protectedApiInstance.put(API.AUTH.UPDATE, data,  { 
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error: Error | any) {
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