import { faker } from '@faker-js/faker';
import { Notification } from '../types';

const NOTIFICATION_TYPES = [
    'session_start',
    'session_end',
    'payment',
    'promo',
    'system',
] as const;

const NOTIFICATION_TEMPLATES: Record<typeof NOTIFICATION_TYPES[number], () => { title: string; body: string }> = {
    session_start: () => ({
        title: 'Parking Started',
        body: `Your parking session has started at ${faker.company.name()} Parking`,
    }),
    session_end: () => ({
        title: 'Parking Ended',
        body: `Your parking session has ended. Total: €${faker.number.float({ min: 2, max: 20, fractionDigits: 2 })}`,
    }),
    payment: () => ({
        title: faker.helpers.arrayElement(['Payment Successful', 'Payment Failed']),
        body: faker.helpers.arrayElement([
            `€${faker.number.float({ min: 5, max: 50, fractionDigits: 2 })} has been charged`,
            'Your payment could not be processed. Please update your payment method.'
        ]),
    }),
    promo: () => ({
        title: faker.helpers.arrayElement([
            '🎉 Special Offer!',
            '💰 Save 20% Today!',
            '🅿️ Weekend Parking Deal',
        ]),
        body: faker.helpers.arrayElement([
            'Get 20% off your next parking session',
            'Free first hour at selected garages',
            'Double wallet credit on top-ups this week',
        ]),
    }),
    system: () => ({
        title: 'System Update',
        body: faker.helpers.arrayElement([
            'App update available with new features',
            'Scheduled maintenance on Sunday 2-4 AM',
            'New garages added in your area',
        ]),
    }),
};

export function generateNotification(userId: string): Notification {
    const type = faker.helpers.arrayElement([...NOTIFICATION_TYPES]);
    const template = NOTIFICATION_TEMPLATES[type]();

    return {
        id: `notif_${faker.string.alphanumeric(8)}`,
        userId,
        type,
        title: template.title,
        body: template.body,
        read: faker.datatype.boolean({ probability: 0.7 }),
        createdAt: faker.date.recent({ days: 30 }).toISOString(),
    };
}

export function generateNotifications(
    users: Array<{ id: string }>,
    perUser: { min: number; max: number } = { min: 5, max: 15 }
): Notification[] {
    const notifications: Notification[] = [];

    users.forEach((user) => {
        const count = faker.number.int(perUser);
        for (let i = 0; i < count; i++) {
            notifications.push(generateNotification(user.id));
        }
    });

    // Sort by date descending
    notifications.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return notifications;
}
