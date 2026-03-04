import { apiClient } from "./api.client";

export const warehouseService = {
    getAll: async () => {
        const { data } = await apiClient.get("/warehouses");
        return data;
    },
    create: async (payload: any) => {
        const { data } = await apiClient.post("/warehouses", payload);
        return data;
    },
    update: async (id: string, payload: any) => {
        const { data } = await apiClient.put(`/warehouses/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await apiClient.delete(`/warehouses/${id}`);
        return data;
    }
};
