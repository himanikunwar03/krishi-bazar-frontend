import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const register = async (data: any) => {
    try {
        const response =
            await axiosInstance.post(API.AUTH.REGISTER, data); // path, data
        return response.data; // reponse ko body
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message
            || 'Registration failed');
        // error?.response?.data -> response ko body
    }
}

export const login = async (data: any) => {
    try {
        const response =
            await axiosInstance.post(API.AUTH.LOGIN, data); // path, data
        return response.data; // reponse ko body
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message
            || 'Login failed');
    }
}

export const whoami = async () => {
    try {
        const response =
            await axiosInstance.get(API.AUTH.WHOAMI);
        return response.data; // reponse ko body
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message
            || 'Failed to fetch user details');
    }
}

export const updateProfile = async (data: any) => {
    try {
        const response = await axiosInstance.put(API.AUTH.UPDATE, data,  { 
            headers: {
                'Content-Type': 'multipart/form-data' // multipart/form-data for file upload
            }
        });
        return response.data; // reponse ko body
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message
            || 'Failed to update profile');
    }
}

export const updatePassword = async (data: any) => {
    try {
        const response = await axiosInstance.put(API.AUTH.UPDATE_PASSWORD, data);
        return response.data; // reponse ko body
    }
    catch (error: Error | any) {
        throw new Error(error?.response?.data?.message
            || 'Failed to update password');
    }
}