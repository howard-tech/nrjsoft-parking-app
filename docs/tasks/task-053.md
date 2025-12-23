# TASK-053: Mock Data Generator & Seeder

## Task Overview

| Field | Value |
|-------|-------|
| Task ID | TASK-053 |
| Module | Backend / Mock API |
| Priority | High |
| Effort | 6h |
| Dependencies | TASK-052 |
| Status | 🔴 Not Started |

## Description

Create comprehensive mock data generators and seeders for the Mock API. This includes realistic parking garages in European cities, user profiles, vehicles, parking sessions, transactions, and on-street zones with dynamic pricing.

## Acceptance Criteria

- [ ] Generate realistic garage data for multiple EU cities
- [ ] Create diverse user profiles with vehicles
- [ ] Generate historical parking sessions
- [ ] Create wallet transactions history
- [ ] Generate on-street parking zones with zone-specific rules
- [ ] Include EU license plate formats
- [ ] Seed database on startup
- [ ] Allow data reset via API endpoint

## Technical Implementation

### Data Generator

```typescript
// src/generators/index.ts
import { faker } from '@faker-js/faker';

export interface Garage {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  location: { lat: number; lng: number };
  entryMethod: 'ANPR' | 'QR';
  availableSlots: number;
  totalSlots: number;
  hourlyRate: number;
  maxTime: number;
  currency: string;
  features: GarageFeatures;
  policies: GaragePolicies;
  operatingHours: OperatingHours;
  images: string[];
}

// European cities with coordinates
const EU_CITIES = [
  { city: 'Ruse', country: 'BG', lat: 43.8356, lng: 25.9657 },
  { city: 'Sofia', country: 'BG', lat: 42.6977, lng: 23.3219 },
  { city: 'Munich', country: 'DE', lat: 48.1351, lng: 11.5820 },
  { city: 'Berlin', country: 'DE', lat: 52.5200, lng: 13.4050 },
  { city: 'Vienna', country: 'AT', lat: 48.2082, lng: 16.3738 },
  { city: 'Prague', country: 'CZ', lat: 50.0755, lng: 14.4378 },
];

// EU License plate patterns
const LICENSE_PATTERNS = {
  BG: () => `${faker.string.alpha({ length: 2, casing: 'upper' })} ${faker.string.numeric(4)} ${faker.string.alpha({ length: 2, casing: 'upper' })}`,
  DE: () => `${faker.string.alpha({ length: 1-3, casing: 'upper' })}-${faker.string.alpha({ length: 2, casing: 'upper' })} ${faker.string.numeric(4)}`,
  AT: () => `${faker.string.alpha({ length: 2, casing: 'upper' })}-${faker.string.numeric(5)}${faker.string.alpha({ length: 1, casing: 'upper' })}`,
  CZ: () => `${faker.string.numeric(1)}${faker.string.alpha({ length: 1, casing: 'upper' })}${faker.string.numeric(1)} ${faker.string.numeric(4)}`,
  EU: () => `${faker.string.alpha({ length: 2, casing: 'upper' })} ${faker.string.numeric(3)} ${faker.string.alpha({ length: 2, casing: 'upper' })}`,
};

export function generateGarage(cityData?: typeof EU_CITIES[0]): Garage {
  const city = cityData || faker.helpers.arrayElement(EU_CITIES);
  const totalSlots = faker.number.int({ min: 50, max: 500 });
  
  return {
    id: `garage_${faker.string.uuid().slice(0, 8)}`,
    name: faker.helpers.arrayElement([
      `${city.city} Central Parking`,
      `${faker.company.name()} Garage`,
      `${faker.location.street()} Parking`,
      `City ${faker.helpers.arrayElement(['Plaza', 'Center', 'Hub', 'Tower'])} Parking`,
    ]),
    address: faker.location.streetAddress(),
    city: city.city,
    country: city.country,
    location: {
      lat: city.lat + faker.number.float({ min: -0.05, max: 0.05 }),
      lng: city.lng + faker.number.float({ min: -0.05, max: 0.05 }),
    },
    entryMethod: faker.helpers.arrayElement(['ANPR', 'QR']),
    availableSlots: faker.number.int({ min: 0, max: totalSlots }),
    totalSlots,
    hourlyRate: faker.number.float({ min: 2, max: 8, fractionDigits: 2 }),
    maxTime: faker.helpers.arrayElement([120, 180, 240, 480, 720, 1440]),
    currency: 'EUR',
    features: {
      evChargers: faker.number.int({ min: 0, max: 10 }),
      security: faker.helpers.arrayElement(['ANPR + patrols', 'CCTV', 'Guard 24/7']),
      coveredParking: faker.datatype.boolean(),
      disabledAccess: faker.datatype.boolean(),
      carWash: faker.datatype.boolean({ probability: 0.3 }),
    },
    policies: {
      prepayRequired: faker.datatype.boolean({ probability: 0.2 }),
      badgeAfterHour: faker.helpers.arrayElement([null, 20, 21, 22, 23]),
      overstayPenalty: faker.number.float({ min: 10, max: 25, fractionDigits: 0 }),
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

export function generateUser(): User {
  const country = faker.helpers.arrayElement(['BG', 'DE', 'AT', 'CZ']);
  
  return {
    id: `user_${faker.string.uuid().slice(0, 8)}`,
    email: faker.internet.email(),
    phone: faker.phone.number('+49 ### ### ####'),
    name: faker.person.fullName(),
    language: faker.helpers.arrayElement(['en', 'de', 'bg']),
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    vehicles: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
      id: `vehicle_${faker.string.uuid().slice(0, 8)}`,
      plate: LICENSE_PATTERNS[country](),
      country,
      nickname: faker.helpers.arrayElement(['My Car', 'Family Car', 'Work Car', null]),
      isDefault: false,
    })),
  };
}

export function generateParkingSession(userId: string, garageId: string): Session {
  const startTime = faker.date.recent({ days: 30 });
  const durationMinutes = faker.number.int({ min: 15, max: 480 });
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
  const hourlyRate = faker.number.float({ min: 2, max: 8, fractionDigits: 2 });
  
  return {
    id: `session_${faker.string.uuid().slice(0, 8)}`,
    userId,
    garageId,
    garageName: faker.company.name() + ' Parking',
    vehiclePlate: LICENSE_PATTERNS.EU(),
    entryMethod: faker.helpers.arrayElement(['ANPR', 'QR']),
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    status: 'completed',
    durationMinutes,
    hourlyRate,
    totalFee: Math.round((durationMinutes / 60) * hourlyRate * 100) / 100,
    currency: 'EUR',
    paymentMethod: faker.helpers.arrayElement(['card', 'wallet', 'apple_pay', 'google_pay']),
  };
}

export function generateOnStreetZone(city: typeof EU_CITIES[0]): OnStreetZone {
  return {
    id: `zone_${faker.string.uuid().slice(0, 8)}`,
    name: `${faker.helpers.arrayElement(['Blue', 'Green', 'Yellow', 'Red'])} Zone ${faker.location.secondaryAddress()}`,
    city: city.city,
    country: city.country,
    location: {
      lat: city.lat + faker.number.float({ min: -0.02, max: 0.02 }),
      lng: city.lng + faker.number.float({ min: -0.02, max: 0.02 }),
    },
    radius: faker.number.int({ min: 100, max: 500 }),
    pricing: {
      hourlyRate: faker.number.float({ min: 1, max: 5, fractionDigits: 2 }),
      minDuration: faker.helpers.arrayElement([15, 30]),
      maxDuration: faker.helpers.arrayElement([120, 180, 240]),
      currency: 'EUR',
    },
    rules: {
      operatingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      operatingHours: { start: '08:00', end: '20:00' },
      freeOnWeekends: faker.datatype.boolean({ probability: 0.5 }),
    },
    available: true,
  };
}

export function generateWalletTransaction(userId: string): Transaction {
  const isTopup = faker.datatype.boolean({ probability: 0.3 });
  
  return {
    id: `txn_${faker.string.uuid().slice(0, 8)}`,
    userId,
    type: isTopup ? 'topup' : 'payment',
    amount: isTopup 
      ? faker.helpers.arrayElement([10, 20, 50, 100])
      : faker.number.float({ min: 2, max: 30, fractionDigits: 2 }),
    currency: 'EUR',
    description: isTopup 
      ? 'Wallet top-up' 
      : `Parking at ${faker.company.name()}`,
    status: 'completed',
    createdAt: faker.date.recent({ days: 60 }).toISOString(),
    paymentMethod: faker.helpers.arrayElement(['card', 'apple_pay', 'google_pay']),
  };
}

// Seeder function
export async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Generate garages
  const garages = EU_CITIES.flatMap(city => 
    Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, 
      () => generateGarage(city)
    )
  );
  console.log(`   ✓ Generated ${garages.length} garages`);

  // Generate users
  const users = Array.from({ length: 20 }, generateUser);
  console.log(`   ✓ Generated ${users.length} users`);

  // Generate sessions
  const sessions = users.flatMap(user =>
    Array.from({ length: faker.number.int({ min: 5, max: 20 }) }, () =>
      generateParkingSession(user.id, faker.helpers.arrayElement(garages).id)
    )
  );
  console.log(`   ✓ Generated ${sessions.length} sessions`);

  // Generate on-street zones
  const zones = EU_CITIES.flatMap(city =>
    Array.from({ length: faker.number.int({ min: 5, max: 15 }) },
      () => generateOnStreetZone(city)
    )
  );
  console.log(`   ✓ Generated ${zones.length} on-street zones`);

  // Generate transactions
  const transactions = users.flatMap(user =>
    Array.from({ length: faker.number.int({ min: 10, max: 30 }) },
      () => generateWalletTransaction(user.id)
    )
  );
  console.log(`   ✓ Generated ${transactions.length} transactions`);

  console.log('✅ Database seeded successfully!');

  return { garages, users, sessions, zones, transactions };
}
```

## Files to Create

| File | Purpose |
|------|---------|
| mock-api/src/generators/index.ts | Main generator |
| mock-api/src/generators/garage.ts | Garage data |
| mock-api/src/generators/user.ts | User data |
| mock-api/src/generators/session.ts | Session data |
| mock-api/src/generators/zone.ts | On-street zones |
| mock-api/src/generators/transaction.ts | Wallet transactions |
| mock-api/src/seed.ts | Seeder script |

## Testing Checklist

- [ ] Generated data is realistic
- [ ] EU license plates follow correct formats
- [ ] Coordinates are within city boundaries
- [ ] Pricing is sensible for EU markets
- [ ] Historical sessions have valid timelines
- [ ] Seeder runs without errors

## Related Tasks

- Previous: TASK-052 (Mock Backend API)
- Next: TASK-054 (API Simulation Features)
