// centralized path definitions for API endpoints
export const API = {
    AUTH: {
        REGISTER: "/api/v1/auth/register",
        LOGIN: "/api/v1/auth/login",
        WHOAMI: "/api/v1/auth/whoami",
        UPDATE: "/api/v1/auth/update",
        UPDATE_PASSWORD: "/api/v1/auth/update-password",
    },
    ADMIN: {
        USERS: "/api/v1/admin/users",
        USER_BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
    },
    PRODUCTS: {
        GET_ALL: "/api/v1/products",
        GET_BY_ID: (id: string) => `/api/v1/products/${id}`,
        SEARCH: "/api/v1/products/search",
        BY_CATEGORY: (category: string) => `/api/v1/products/category/${category}`,
        CREATE: "/api/v1/products",
        UPDATE: (id: string) => `/api/v1/products/${id}`,
        DELETE: (id: string) => `/api/v1/products/${id}`,
        FARMER_PRODUCTS: "/api/v1/products/farmer/my-products",
    },
    ORDERS: {
        CREATE: "/api/v1/orders",
        GET_BY_ID: (id: string) => `/api/v1/orders/${id}`,
        MY_ORDERS: "/api/v1/orders/my-orders",
        FARMER_ORDERS: "/api/v1/orders/farmer/my-orders",
        UPDATE_STATUS: (id: string) => `/api/v1/orders/${id}/status`,
        CANCEL: (id: string) => `/api/v1/orders/${id}/cancel`,
    }
}