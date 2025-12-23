import { faker } from '@faker-js/faker';
import { PaymentMethod } from '../types';

const CARD_BRANDS = ['Visa', 'Mastercard', 'Amex'] as const;

export function generatePaymentMethod(userId: string, isDefault: boolean = false): PaymentMethod {
    const type = faker.helpers.arrayElement(['card', 'apple_pay', 'google_pay'] as const);

    const baseMethod = {
        id: `pm_${faker.string.alphanumeric(8)}`,
        userId,
        type,
        isDefault,
        createdAt: faker.date.past({ years: 1 }).toISOString(),
    };

    if (type === 'card') {
        return {
            ...baseMethod,
            type: 'card',
            last4: faker.string.numeric(4),
            brand: faker.helpers.arrayElement([...CARD_BRANDS]),
            expiryMonth: faker.number.int({ min: 1, max: 12 }),
            expiryYear: faker.number.int({ min: 2025, max: 2030 }),
        };
    }

    return baseMethod;
}

export function generatePaymentMethods(
    users: Array<{ id: string }>,
    perUser: { min: number; max: number } = { min: 1, max: 3 }
): PaymentMethod[] {
    const methods: PaymentMethod[] = [];

    users.forEach((user) => {
        const count = faker.number.int(perUser);
        for (let i = 0; i < count; i++) {
            methods.push(generatePaymentMethod(user.id, i === 0));
        }
    });

    return methods;
}
