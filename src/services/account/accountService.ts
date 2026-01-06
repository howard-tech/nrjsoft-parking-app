import { apiClient } from '@services/api';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
}

export interface Vehicle {
    id: string;
    userId?: string;
    plate: string;
    nickname?: string;
    make?: string;
    model?: string;
    color?: string;
    isDefault?: boolean;
}

export interface NotificationPreferences {
    push: boolean;
    email: boolean;
    sms: boolean;
}

export const accountService = {
    async getProfile(): Promise<UserProfile> {
        const response = await apiClient.get<UserProfile>('/me');
        return response.data;
    },

    async updateProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
        const response = await apiClient.put<UserProfile>('/me', payload);
        return response.data;
    },

    async getVehicles(): Promise<Vehicle[]> {
        const response = await apiClient.get<Vehicle[] | { vehicles?: Vehicle[] }>('/me/vehicles');
        const data = Array.isArray(response.data) ? response.data : response.data.vehicles ?? [];
        return data;
    },

    async addVehicle(payload: { plate: string; nickname?: string; make?: string; model?: string; color?: string; isDefault?: boolean }): Promise<Vehicle> {
        const response = await apiClient.post<Vehicle>('/me/vehicles', payload);
        return response.data;
    },

    async updateVehicle(id: string, payload: Partial<Vehicle>): Promise<Vehicle> {
        const response = await apiClient.put<Vehicle>(`/me/vehicles/${id}`, payload);
        return response.data;
    },

    async deleteVehicle(id: string): Promise<void> {
        await apiClient.delete(`/me/vehicles/${id}`);
    },

    async setDefaultVehicle(id: string): Promise<Vehicle> {
        const response = await apiClient.put<Vehicle>(`/me/vehicles/${id}`, { isDefault: true });
        return response.data;
    },

    async getNotificationPreferences(): Promise<NotificationPreferences> {
        const response = await apiClient.get<NotificationPreferences>('/me/notification-preferences');
        return response.data;
    },

    async updateNotificationPreferences(prefs: NotificationPreferences): Promise<NotificationPreferences> {
        const response = await apiClient.put<NotificationPreferences>('/me/notification-preferences', prefs);
        return response.data;
    },
};
