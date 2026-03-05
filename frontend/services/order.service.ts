import { apiClient } from "./api.client";

export const orderService = {
    getOrders: async (type?: string) => {
        const url = type ? `/orders?type=${type}` : "/orders";
        const { data } = await apiClient.get(url);
        return data;
    },
    getById: async (id: string) => {
        const { data } = await apiClient.get(`/orders/${id}`);
        return data;
    },
    create: async (payload: any) => {
        const { data } = await apiClient.post("/orders", payload);
        return data;
    },
    tracking: async (code: string) => {
        const { data } = await apiClient.get(`/orders/tracking/${code}`);
        return data;
    },
    getPaymentStatus: async (id: string) => {
        const { data } = await apiClient.get(`/orders/${id}/payment-status`);
        return data;
    },
    getPaymentLink: async (id: string) => {
        const { data } = await apiClient.get(`/orders/${id}/payment-link`);
        return data;
    },
    switchToCod: async (id: string) => {
        const { data } = await apiClient.post(`/orders/${id}/switch-cod`, {});
        return data;
    },
    cancel: async (id: string) => {
        const { data } = await apiClient.post(`/orders/${id}/cancel`, {});
        return data;
    }
};
