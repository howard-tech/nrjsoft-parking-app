import { faker } from '@faker-js/faker';

// European cities with coordinates
export const EU_CITIES = [
    { city: 'Ruse', country: 'BG', lat: 43.8356, lng: 25.9657 },
    { city: 'Sofia', country: 'BG', lat: 42.6977, lng: 23.3219 },
    { city: 'Munich', country: 'DE', lat: 48.1351, lng: 11.5820 },
    { city: 'Berlin', country: 'DE', lat: 52.5200, lng: 13.4050 },
    { city: 'Vienna', country: 'AT', lat: 48.2082, lng: 16.3738 },
    { city: 'Prague', country: 'CZ', lat: 50.0755, lng: 14.4378 },
] as const;

export type CityData = typeof EU_CITIES[number];

// EU License plate patterns by country
export const LICENSE_PATTERNS: Record<string, () => string> = {
    BG: () => `${faker.string.alpha({ length: 2, casing: 'upper' })} ${faker.string.numeric(4)} ${faker.string.alpha({ length: 2, casing: 'upper' })}`,
    DE: () => `${faker.string.alpha({ length: 2, casing: 'upper' })}-${faker.string.alpha({ length: 2, casing: 'upper' })} ${faker.string.numeric(4)}`,
    AT: () => `${faker.string.alpha({ length: 2, casing: 'upper' })}-${faker.string.numeric(5)}${faker.string.alpha({ length: 1, casing: 'upper' })}`,
    CZ: () => `${faker.string.numeric(1)}${faker.string.alpha({ length: 1, casing: 'upper' })}${faker.string.numeric(1)} ${faker.string.numeric(4)}`,
    EU: () => `${faker.string.alpha({ length: 2, casing: 'upper' })} ${faker.string.numeric(3)} ${faker.string.alpha({ length: 2, casing: 'upper' })}`,
};

// Get random EU city
export function getRandomCity(): CityData {
    return faker.helpers.arrayElement([...EU_CITIES]);
}

// Generate license plate for country
export function generateLicensePlate(country: string = 'EU'): string {
    const generator = LICENSE_PATTERNS[country] || LICENSE_PATTERNS.EU;
    return generator();
}

// Car makes and models
export const CAR_MAKES = [
    { make: 'BMW', models: ['320d', '520d', 'X3', 'X5', 'M3'] },
    { make: 'Audi', models: ['A3', 'A4', 'A6', 'Q5', 'Q7'] },
    { make: 'Mercedes-Benz', models: ['C200', 'E220', 'GLC', 'GLE', 'S350'] },
    { make: 'Volkswagen', models: ['Golf', 'Passat', 'Tiguan', 'Polo', 'Arteon'] },
    { make: 'Toyota', models: ['Corolla', 'Camry', 'RAV4', 'Yaris', 'C-HR'] },
    { make: 'Skoda', models: ['Octavia', 'Superb', 'Kodiaq', 'Fabia', 'Karoq'] },
    { make: 'Renault', models: ['Megane', 'Clio', 'Captur', 'Kadjar', 'Scenic'] },
    { make: 'Peugeot', models: ['208', '308', '3008', '5008', '508'] },
];

// Get random car
export function getRandomCar(): { make: string; model: string } {
    const carMake = faker.helpers.arrayElement(CAR_MAKES);
    return {
        make: carMake.make,
        model: faker.helpers.arrayElement(carMake.models),
    };
}

// Car colors
export const CAR_COLORS = [
    'Black', 'White', 'Silver', 'Gray', 'Blue', 'Red', 'Green', 'Brown', 'Orange', 'Yellow'
];

export function getRandomColor(): string {
    return faker.helpers.arrayElement(CAR_COLORS);
}
