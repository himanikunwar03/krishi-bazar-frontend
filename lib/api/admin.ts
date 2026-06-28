import { protectedApiInstance } from "./axios-instance";
import { API } from "./endpoints";

export interface User {
    _id: string;
    username?: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "admin" | "user" | "customer";
    profileImage?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedUsersResponse {
    data: {
        data: User[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
    password: string;
    role?: "admin" | "user" | "customer";
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    password?: string;
    role?: "admin" | "user" | "customer";
    profileImage?: string;
}

// Get all users with pagination and search
export const getAllUsers = async (page: number = 1, limit: number = 10, search?: string): Promise<PaginatedUsersResponse> => {
    try {
        const params: any = { page, limit };
        if (search) params.search = search;
        
        const response = await protectedApiInstance.get(API.ADMIN.USERS, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch users');
    }
};

// Get user by ID
export const getUserById = async (id: string): Promise<{ data: User }> => {
    try {
        const response = await protectedApiInstance.get(API.ADMIN.USER_BY_ID(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch user');
    }
};

// Create user
export const createUser = async (data: CreateUserRequest): Promise<{ data: User }> => {
    try {
        const response = await protectedApiInstance.post(API.ADMIN.USERS, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to create user');
    }
};

// Update user
export const updateUser = async (id: string, data: UpdateUserRequest): Promise<{ data: User }> => {
    try {
        const response = await protectedApiInstance.put(API.ADMIN.USER_BY_ID(id), data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to update user');
    }
};

// Delete user
export const deleteUser = async (id: string): Promise<{ data: { deleted: boolean } }> => {
    try {
        const response = await protectedApiInstance.delete(API.ADMIN.USER_BY_ID(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to delete user');
    }
};
