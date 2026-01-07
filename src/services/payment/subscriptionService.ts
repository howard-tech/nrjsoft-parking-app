import { apiClient } from '@services/api';

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'week' | 'month' | 'year';
    benefits: string[];
    vehicleLimit: number;
    isPopular?: boolean;
}

export interface UserSubscription {
    id: string;
    planId: string;
    status: 'active' | 'cancelled' | 'expired';
    startDate: string;
    endDate: string;
    autoRenew: boolean;
    nextBillingDate?: string;
}

export const subscriptionService = {
    async getPlans(): Promise<SubscriptionPlan[]> {
        const response = await apiClient.get<{ data?: SubscriptionPlan[]; plans?: SubscriptionPlan[] }>(
            '/subscriptions/plans'
        );
        return response.data?.data ?? response.data?.plans ?? [];
    },

    async getActiveSubscription(): Promise<UserSubscription | null> {
        const response = await apiClient.get<{ data?: UserSubscription | null; subscription?: UserSubscription | null }>(
            '/subscriptions/active'
        );
        return response.data?.data ?? response.data?.subscription ?? null;
    },

    async subscribe(planId: string, paymentMethodId: string): Promise<UserSubscription> {
        const response = await apiClient.post<{ data?: UserSubscription; subscription?: UserSubscription }>(
            '/subscriptions',
            { planId, paymentMethodId }
        );
        return response.data?.data ?? response.data?.subscription ?? {
            id: `sub_${Date.now()}`,
            planId,
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            autoRenew: true,
        };
    },

    async cancel(subscriptionId: string): Promise<UserSubscription | null> {
        const response = await apiClient.post<{ data?: UserSubscription; subscription?: UserSubscription }>(
            `/subscriptions/${subscriptionId}/cancel`
        );
        return response.data?.data ?? response.data?.subscription ?? null;
    },

    async toggleAutoRenew(subscriptionId: string, autoRenew: boolean): Promise<UserSubscription | null> {
        const response = await apiClient.patch<{ data?: UserSubscription; subscription?: UserSubscription }>(
            `/subscriptions/${subscriptionId}`,
            { autoRenew }
        );
        return response.data?.data ?? response.data?.subscription ?? null;
    },
};
