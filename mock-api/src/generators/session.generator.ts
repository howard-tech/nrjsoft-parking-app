import { faker } from '@faker-js/faker';
import { ParkingSession } from '../types';
import { generateLicensePlate } from './constants';

export function generateSession(
    userId: string,
    garageId: string,
    garageName: string,
    hourlyRate: number
): ParkingSession {
    const startTime = faker.date.recent({ days: 60 });
    const durationMinutes = faker.number.int({ min: 15, max: 480 });
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    const totalFee = Math.round((durationMinutes / 60) * hourlyRate * 100) / 100;

    return {
        id: `session_${faker.string.alphanumeric(8)}`,
        userId,
        garageId,
        garageName,
        vehiclePlate: generateLicensePlate(),
        entryMethod: faker.helpers.arrayElement(['ANPR', 'QR', 'MANUAL'] as const),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: 'completed',
        hourlyRate,
        currency: 'EUR',
        elapsedMinutes: durationMinutes,
        totalFee,
        paymentStatus: 'paid',
    };
}

export function generateSessions(
    users: Array<{ id: string }>,
    garages: Array<{ id: string; name: string; hourlyRate: number }>,
    sessionsPerUser: { min: number; max: number } = { min: 5, max: 15 }
): ParkingSession[] {
    const sessions: ParkingSession[] = [];

    users.forEach((user) => {
        const sessionCount = faker.number.int(sessionsPerUser);

        for (let i = 0; i < sessionCount; i++) {
            const garage = faker.helpers.arrayElement(garages);
            sessions.push(generateSession(user.id, garage.id, garage.name, garage.hourlyRate));
        }
    });

    // Sort by start time descending
    sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return sessions;
}
