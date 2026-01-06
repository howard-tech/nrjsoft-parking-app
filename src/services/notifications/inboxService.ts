import { apiClient } from '@services/api';

export interface NotificationItem {
    id: string;
    title: string;
    body: string;
    type?: string;
    createdAt: string;
    read?: boolean;
    metadata?: Record<string, unknown>;
}

export const inboxService = {
    async list(page = 1, limit = 20): Promise<{ items: NotificationItem[]; hasMore: boolean }> {
        const response = await apiClient.get<{ notifications?: NotificationItem[]; data?: NotificationItem[]; total?: number }>(
            '/notifications',
            { params: { page, limit } }
        );
        const items = response.data?.notifications ?? response.data?.data ?? [];
        const total = response.data?.total ?? items.length;
        return {
            items,
            hasMore: page * limit < total,
        };
    },

    async markRead(id: string): Promise<void> {
        await apiClient.put(`/notifications/${id}/read`);
    },
};
