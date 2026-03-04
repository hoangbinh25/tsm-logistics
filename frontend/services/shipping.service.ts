import { apiClient } from "./api.client";

export const shippingService = {
    getAll: async () => {
        const { data } = await apiClient.get("/services");
        return data;
    },
    create: async (payload: any) => {
        const { data } = await apiClient.post("/services", payload);
        return data;
    },
    update: async (id: string, payload: any) => {
        const { data } = await apiClient.put(`/services/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await apiClient.delete(`/services/${id}`);
        return data;
    }
};
