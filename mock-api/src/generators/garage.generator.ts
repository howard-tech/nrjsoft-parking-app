import { faker } from '@faker-js/faker';
import { Garage } from '../types';
import { EU_CITIES, CityData, getRandomCity } from './constants';

const GARAGE_NAME_TEMPLATES = [
    (city: string) => `${city} Central Parking`,
    (city: string) => `${city} City Garage`,
    () => `${faker.company.name()} Parking`,
    () => `${faker.location.street()} Garage`,
    () => `${faker.helpers.arrayElement(['Plaza', 'Center', 'Hub', 'Tower', 'Square'])} Parking`,
    () => `${faker.helpers.arrayElement(['Premium', 'Express', 'Metro', 'Park&Ride'])} Parking`,
];

export function generateGarage(cityData?: CityData): Garage {
    const city = cityData || getRandomCity();
    const totalSlots = faker.number.int({ min: 50, max: 500 });
    const availableSlots = faker.number.int({ min: 0, max: totalSlots });

    const nameTemplate = faker.helpers.arrayElement(GARAGE_NAME_TEMPLATES);

    return {
        id: `garage_${faker.string.alphanumeric(8)}`,
        name: nameTemplate(city.city),
        address: `${faker.location.streetAddress()}, ${city.city}`,
        location: {
            lat: city.lat + faker.number.float({ min: -0.05, max: 0.05 }),
            lng: city.lng + faker.number.float({ min: -0.05, max: 0.05 }),
        },
        entryMethod: faker.helpers.arrayElement(['ANPR', 'QR', 'TICKET'] as const),
        availableSlots,
        totalSlots,
        hourlyRate: faker.number.float({ min: 2, max: 8, fractionDigits: 2 }),
        maxTime: faker.helpers.arrayElement([120, 180, 240, 480, 720, 1440]),
        currency: 'EUR',
        features: {
            evChargers: faker.number.int({ min: 0, max: 10 }),
            security: faker.helpers.arrayElement(['ANPR + patrols', 'CCTV', '24/7 security staff']),
            coveredParking: faker.datatype.boolean(),
            disabledAccess: faker.datatype.boolean({ probability: 0.8 }),
        },
        policies: {
            prepayRequired: faker.datatype.boolean({ probability: 0.2 }),
            badgeAfterHour: faker.helpers.arrayElement([null, 20, 21, 22, 23]),
            overstayPenalty: faker.number.int({ min: 10, max: 25 }),
        },
        operatingHours: {
            open: faker.helpers.arrayElement(['00:00', '06:00', '07:00']),
            close: faker.helpers.arrayElement(['24:00', '23:00', '22:00']),
        },
        images: [
            `https://picsum.photos/seed/${faker.string.alphanumeric(8)}/800/600`,
        ],
    };
}

export function generateGarages(count: number = 30): Garage[] {
    // Distribute garages across EU cities
    const garages: Garage[] = [];

    EU_CITIES.forEach((city) => {
        const cityGarageCount = Math.ceil(count / EU_CITIES.length);
        for (let i = 0; i < cityGarageCount; i++) {
            garages.push(generateGarage(city));
        }
    });

    return garages.slice(0, count);
}
