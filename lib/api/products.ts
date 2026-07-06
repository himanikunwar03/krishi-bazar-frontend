import { publicApiInstance, protectedApiInstance } from "./axios-instance";
import { API } from "./endpoints";

// Public endpoints
export const getAllProducts = async (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
    try {
        const response = await publicApiInstance.get(API.PRODUCTS.GET_ALL, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch products');
    }
};

export const getProductById = async (id: string) => {
    try {
        const response = await publicApiInstance.get(API.PRODUCTS.GET_BY_ID(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch product');
    }
};

export const searchProducts = async (query: string) => {
    try {
        const response = await publicApiInstance.get(API.PRODUCTS.SEARCH, { params: { q: query } });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to search products');
    }
};

export const getProductsByCategory = async (category: string) => {
    try {
        const response = await publicApiInstance.get(API.PRODUCTS.BY_CATEGORY(category));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch products by category');
    }
};

// Protected endpoints (farmer only)
export const createProduct = async (data: FormData) => {
    try {
        const response = await protectedApiInstance.post(API.PRODUCTS.CREATE, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to create product');
    }
};

export const updateProduct = async (id: string, data: FormData) => {
    try {
        const response = await protectedApiInstance.put(API.PRODUCTS.UPDATE(id), data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to update product');
    }
};

export const deleteProduct = async (id: string) => {
    try {
        const response = await protectedApiInstance.delete(API.PRODUCTS.DELETE(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to delete product');
    }
};

export const getFarmerProducts = async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
        const response = await protectedApiInstance.get(API.PRODUCTS.FARMER_PRODUCTS, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch farmer products');
    }
};
