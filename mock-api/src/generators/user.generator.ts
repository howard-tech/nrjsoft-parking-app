import { faker } from '@faker-js/faker';
import { User, Vehicle } from '../types';
import { EU_CITIES, generateLicensePlate, getRandomCar, getRandomColor } from './constants';

export function generateVehicle(userId: string, country: string = 'EU', isDefault: boolean = false): Vehicle {
    const car = getRandomCar();
    const nicknames = ['My Car', 'Family Car', 'Work Car', 'Second Car'];

    return {
        id: `vehicle_${faker.string.alphanumeric(8)}`,
        userId,
        plate: generateLicensePlate(country),
        nickname: faker.datatype.boolean({ probability: 0.6 })
            ? faker.helpers.arrayElement(nicknames)
            : undefined,
        make: car.make,
        model: car.model,
        color: getRandomColor(),
        isDefault,
        createdAt: faker.date.past({ years: 2 }).toISOString(),
    };
}

export function generateUser(): User {
    const country = faker.helpers.arrayElement(['BG', 'DE', 'AT', 'CZ']);
    const hasPhone = faker.datatype.boolean({ probability: 0.8 });
    const hasEmail = faker.datatype.boolean({ probability: 0.9 });

    // Phone formats by country
    const phoneFormats: Record<string, string> = {
        BG: '+359888######',
        DE: '+491########',
        AT: '+436########',
        CZ: '+420#########',
    };

    const generatePhone = (format: string) => {
        return format.replace(/#/g, () => faker.string.numeric(1));
    };

    return {
        id: `user_${faker.string.alphanumeric(8)}`,
        phone: hasPhone ? generatePhone(phoneFormats[country]) : undefined,
        email: hasEmail ? faker.internet.email() : undefined,
        name: faker.person.fullName(),
        avatar: faker.datatype.boolean({ probability: 0.3 })
            ? `https://i.pravatar.cc/150?u=${faker.string.alphanumeric(8)}`
            : undefined,
        provider: faker.helpers.arrayElement(['phone', 'email', 'google', 'apple'] as const),
        createdAt: faker.date.past({ years: 2 }).toISOString(),
    };
}

export function generateUserWithVehicles(): { user: User; vehicles: Vehicle[] } {
    const user = generateUser();
    const country = faker.helpers.arrayElement(['BG', 'DE', 'AT', 'CZ']);
    const vehicleCount = faker.number.int({ min: 1, max: 3 });

    const vehicles: Vehicle[] = [];
    for (let i = 0; i < vehicleCount; i++) {
        vehicles.push(generateVehicle(user.id, country, i === 0));
    }

    return { user, vehicles };
}

export function generateUsers(count: number = 20): { users: User[]; vehicles: Vehicle[] } {
    const users: User[] = [];
    const vehicles: Vehicle[] = [];

    for (let i = 0; i < count; i++) {
        const { user, vehicles: userVehicles } = generateUserWithVehicles();
        users.push(user);
        vehicles.push(...userVehicles);
    }

    return { users, vehicles };
}
