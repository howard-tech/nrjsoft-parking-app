import { faker } from '@faker-js/faker';
import { Zone } from '../types';
import { EU_CITIES, CityData, getRandomCity } from './constants';

const ZONE_TYPES = ['GREEN', 'BLUE', 'RED'] as const;

const ZONE_CONFIGS: Record<typeof ZONE_TYPES[number], { hourlyRate: { min: number; max: number }; maxDuration: number }> = {
    GREEN: { hourlyRate: { min: 0.5, max: 1.5 }, maxDuration: 480 },
    BLUE: { hourlyRate: { min: 1.5, max: 2.5 }, maxDuration: 180 },
    RED: { hourlyRate: { min: 2.5, max: 4.0 }, maxDuration: 120 },
};

export function generateZone(cityData?: CityData): Zone {
    const city = cityData || getRandomCity();
    const zoneType = faker.helpers.arrayElement([...ZONE_TYPES]);
    const config = ZONE_CONFIGS[zoneType];

    return {
        id: `zone_${faker.string.alphanumeric(8)}`,
        name: `${zoneType} Zone - ${faker.location.street()}`,
        type: zoneType,
        location: {
            lat: city.lat + faker.number.float({ min: -0.02, max: 0.02 }),
            lng: city.lng + faker.number.float({ min: -0.02, max: 0.02 }),
        },
        hourlyRate: faker.number.float({
            min: config.hourlyRate.min,
            max: config.hourlyRate.max,
            fractionDigits: 2
        }),
        maxDuration: config.maxDuration,
        currency: 'EUR',
        restrictions: faker.helpers.arrayElement([
            'Mon-Fri 08:00-18:00',
            'Mon-Sat 08:00-20:00',
            'Daily 07:00-21:00',
            'Mon-Fri 07:00-19:00',
        ]),
    };
}

export function generateZones(count: number = 30): Zone[] {
    const zones: Zone[] = [];

    // Distribute zones across EU cities
    EU_CITIES.forEach((city) => {
        const cityZoneCount = Math.ceil(count / EU_CITIES.length);
        for (let i = 0; i < cityZoneCount; i++) {
            zones.push(generateZone(city));
        }
    });

    return zones.slice(0, count);
}
