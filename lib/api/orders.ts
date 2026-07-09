import { protectedApiInstance } from "./axios-instance";
import { API } from "./endpoints";

// Protected endpoints
export const createOrder = async (data: any) => {
    try {
        const response = await protectedApiInstance.post(API.ORDERS.CREATE, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to create order');
    }
};

export const getOrderById = async (id: string) => {
    try {
        const response = await protectedApiInstance.get(API.ORDERS.GET_BY_ID(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch order');
    }
};

export const getMyOrders = async (params?: { page?: number; limit?: number }) => {
    try {
        const response = await protectedApiInstance.get(API.ORDERS.MY_ORDERS, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch orders');
    }
};

export const getFarmerOrders = async () => {
    try {
        const response = await protectedApiInstance.get(API.ORDERS.FARMER_ORDERS);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch farmer orders');
    }
};

export const updateOrderStatus = async (id: string, data: { status: string; paymentStatus?: string }) => {
    try {
        const response = await protectedApiInstance.patch(API.ORDERS.UPDATE_STATUS(id), data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to update order status');
    }
};

export const cancelOrder = async (id: string) => {
    try {
        const response = await protectedApiInstance.patch(API.ORDERS.CANCEL(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to cancel order');
    }
};
