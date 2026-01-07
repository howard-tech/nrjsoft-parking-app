import { Request, Response } from 'express';
import { SubscriptionPlan, UserSubscription } from '../types';
import { subscriptionPlanStore, subscriptionStore } from '../services/data.store';

const seedPlans = (): void => {
    if (subscriptionPlanStore.size > 0) return;
    const plans: SubscriptionPlan[] = [
        {
            id: 'plan_weekly_fleet',
            name: 'Weekly Fleet Pass',
            description: 'Unlimited on-street parking with fleet coverage.',
            price: 29,
            currency: 'EUR',
            interval: 'week',
            benefits: ['Unlimited on-street sessions', 'Priority support', 'Fleet dashboard'],
            vehicleLimit: 5,
            isPopular: true,
        },
        {
            id: 'plan_monthly_commuter',
            name: 'Monthly Commuter Pass',
            description: 'Best for daily commuters in city zones.',
            price: 79,
            currency: 'EUR',
            interval: 'month',
            benefits: ['Unlimited garage sessions', 'Discounted on-street rates', 'Auto-renew'],
            vehicleLimit: 2,
        },
        {
            id: 'plan_monthly_unlimited',
            name: 'Monthly Unlimited',
            description: 'All zones, all garages, unlimited sessions.',
            price: 119,
            currency: 'EUR',
            interval: 'month',
            benefits: ['All zones included', 'Priority reservations', 'Premium support'],
            vehicleLimit: 10,
        },
    ];
    plans.forEach((plan) => subscriptionPlanStore.set(plan.id, plan));
};

const computeEndDate = (interval: SubscriptionPlan['interval']): Date => {
    const now = new Date();
    const end = new Date(now);
    if (interval === 'week') {
        end.setDate(now.getDate() + 7);
    } else if (interval === 'month') {
        end.setMonth(now.getMonth() + 1);
    } else {
        end.setFullYear(now.getFullYear() + 1);
    }
    return end;
};

export class SubscriptionController {
    // GET /subscriptions/plans
    getPlans = async (_req: Request, res: Response): Promise<void> => {
        seedPlans();
        res.json({ data: Array.from(subscriptionPlanStore.values()) });
    };

    // GET /subscriptions/active
    getActive = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const active = Array.from(subscriptionStore.values()).find(
            (sub) => sub.userId === userId && sub.status === 'active'
        );

        res.json({ data: active ?? null });
    };

    // POST /subscriptions
    subscribe = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { planId } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        seedPlans();
        const plan = subscriptionPlanStore.get(planId);
        if (!plan) {
            res.status(404).json({ error: 'Plan not found' });
            return;
        }

        const existing = Array.from(subscriptionStore.values()).find(
            (sub) => sub.userId === userId && sub.status === 'active'
        );
        if (existing) {
            res.status(400).json({ error: 'Active subscription already exists' });
            return;
        }

        const startDate = new Date();
        const endDate = computeEndDate(plan.interval);
        const subscription: UserSubscription = {
            id: `sub_${Date.now()}`,
            userId,
            planId: plan.id,
            status: 'active',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            autoRenew: true,
            nextBillingDate: endDate.toISOString(),
        };

        subscriptionStore.set(subscription.id, subscription);
        res.status(201).json({ data: subscription });
    };

    // POST /subscriptions/:id/cancel
    cancel = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const subscription = subscriptionStore.get(id);
        if (!subscription || subscription.userId !== userId) {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }

        subscription.status = 'cancelled';
        subscription.autoRenew = false;
        subscriptionStore.set(id, subscription);

        res.json({ data: subscription });
    };

    // PATCH /subscriptions/:id
    update = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { id } = req.params;
        const { autoRenew } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const subscription = subscriptionStore.get(id);
        if (!subscription || subscription.userId !== userId) {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }

        if (typeof autoRenew === 'boolean') {
            subscription.autoRenew = autoRenew;
        }

        subscriptionStore.set(id, subscription);
        res.json({ data: subscription });
    };
}
