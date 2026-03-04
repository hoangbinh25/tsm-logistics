import { apiClient } from "./api.client";

export const fleetService = {
    getAll: async () => {
        const { data } = await apiClient.get("/fleet");
        return data;
    },

    create: async (payload: any) => {
        const { data } = await apiClient.post("/fleet", payload);
        return data;
    },

    update: async (id: string, payload: any) => {
        const { data } = await apiClient.put(`/fleet/${id}`, payload);
        return data;
    },

    delete: async (id: string) => {
        const { data } = await apiClient.delete(`/fleet/${id}`);
        return data;
    },

    checkMaintenance: async () => {
        const { data } = await apiClient.get("/fleet/check-maintenance");
        return data;
    },

    confirmMaintenance: async (id: string) => {
        const { data } = await apiClient.post(`/fleet/${id}/maintain`);
        return data;
    },

    updateLocation: async (id: string, location: string) => {
        const { data } = await apiClient.put(`/fleet/${id}/location`, { location });
        return data;
    }
};
