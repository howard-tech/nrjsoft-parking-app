import { Request, Response } from 'express';
import { Garage } from '../types';
import { garageStore } from '../services/data.store';

// Calculate distance between two points (Haversine formula)
function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mapGarageWithCoordinates = (garage: Garage, distanceMeters?: number) => {
    const roundedDistance = typeof distanceMeters === 'number' ? Math.round(distanceMeters) : undefined;
    return {
        ...garage,
        latitude: garage.location.lat,
        longitude: garage.location.lng,
        ...(roundedDistance !== undefined && {
            distance: roundedDistance,
            distanceMeters: roundedDistance,
        }),
    };
};

const championOverrides: Record<string, Partial<Garage & { evChargers?: number }>> = {
    garage_tesla_hub_champion: {
        features: { evChargers: 32, coveredParking: true, disabledAccess: true },
        evChargers: 32,
        policies: { prepayRequired: true, overstayPenalty: 25 },
        hourlyRate: 4,
    },
    garage_budget_champion: {
        hourlyRate: 0.5,
        policies: { prepayRequired: false },
        features: { evChargers: 2, coveredParking: false, disabledAccess: true },
    },
    garage_longstay_champion: {
        maxTime: 43200,
        features: { evChargers: 6, coveredParking: true, disabledAccess: true },
    },
    garage_shoreline_champion: {
        features: { evChargers: 4, coveredParking: true, disabledAccess: true },
    },
    garage_downtown_central_champion: {
        features: { evChargers: 4, coveredParking: true, disabledAccess: true },
        policies: { prepayRequired: true, overstayPenalty: 15 },
    },
};

export class ParkingController {
    // GET /parking/nearby
    getNearby = async (req: Request, res: Response): Promise<void> => {
        const { lat, lng, radius = 5000 } = req.query;

        if (!lat || !lng) {
            res.status(400).json({ error: 'Latitude and longitude required' });
            return;
        }

        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lng as string);
        const radiusMeters = parseInt(radius as string, 10);
        const sortBy = (req.query.sortBy as string) || '';
        const q = (req.query.q as string | undefined)?.toLowerCase().trim();
        const garages = Array.from(garageStore.values());

        const refreshTick = (req.query.refresh as string) === 'true';

        // Simulate live availability for Downtown Central only on explicit refresh calls
        if (refreshTick) {
            const downtownId = 'garage_downtown_central_champion';
            const downtown = garageStore.get(downtownId);
            if (downtown) {
                const delta = Math.floor(Math.random() * 2) + 1; // 1..2
                const direction = Math.random() > 0.5 ? 1 : -1;
                const nextSlots = Math.max(
                    0,
                    Math.min(downtown.totalSlots ?? 100, (downtown.availableSlots ?? 0) + delta * direction)
                );
                const status = nextSlots === 0 ? 'full' : nextSlots > 5 ? 'available' : 'limited';
                garageStore.set(downtownId, { ...downtown, availableSlots: nextSlots, status });
            }
        }

        // Filter garages within radius and calculate distances
        const nearbyGarages = garages
            .filter((garage) =>
                q
                    ? garage.name.toLowerCase().includes(q) || garage.address.toLowerCase().includes(q)
                    : true
            )
            .map((garage) => {
                const distance = calculateDistance(latitude, longitude, garage.location.lat, garage.location.lng);
                return mapGarageWithCoordinates(garage, distance);
            })
            .filter((garage) => (garage.distanceMeters ?? 0) <= radiusMeters)
            .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));

        // Keep availability stable to prevent UI flicker; only Downtown Central is mutated on explicit refresh
        const withStableAvailability = nearbyGarages.map((garage) => {
            const latest = garageStore.get(garage.id);
            return {
                ...garage,
                availableSlots: latest?.availableSlots ?? garage.availableSlots,
                status: latest?.status ?? garage.status,
            };
        });

        const withChampionOverrides = withStableAvailability.map((garage) => {
            const override = championOverrides[garage.id];
            if (!override) return garage;
            return {
                ...garage,
                ...override,
                features: {
                    ...(garage.features ?? {}),
                    ...(override.features ?? {}),
                    ...(override.evChargers ? { evChargers: override.evChargers } : {}),
                },
                evChargers: override.evChargers ?? garage.evChargers,
                policies: override.policies ?? garage.policies,
                maxTime: override.maxTime ?? garage.maxTime,
                hourlyRate: override.hourlyRate ?? garage.hourlyRate,
            };
        });

        let sorted = withChampionOverrides;
        switch (sortBy) {
            case 'nearest':
                sorted = [...withChampionOverrides].sort(
                    (a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0)
                );
                break;
            case 'cheapest':
                sorted = [...withChampionOverrides].sort(
                    (a, b) => (a.hourlyRate ?? Number.MAX_VALUE) - (b.hourlyRate ?? Number.MAX_VALUE)
                );
                break;
            case 'ev_ready':
                sorted = [...withChampionOverrides].sort(
                    (a, b) =>
                        (b.features?.evChargers ?? b.evChargers ?? 0) -
                        (a.features?.evChargers ?? a.evChargers ?? 0)
                );
                break;
            case 'max_time':
                sorted = [...withChampionOverrides].sort(
                    (a, b) => (b.maxTime ?? 0) - (a.maxTime ?? 0)
                );
                break;
            default:
                sorted = withChampionOverrides;
                break;
        }

        await delay(700);

        res.json({
            garages: sorted,
            total: sorted.length,
        });
    };

    // GET /parking/:garageId
    getGarage = async (req: Request, res: Response): Promise<void> => {
        const { garageId } = req.params;

        const garage = garageStore.get(garageId);

        if (!garage) {
            res.status(404).json({ error: 'Garage not found' });
            return;
        }

        // Simulate real-time availability
        const updatedGarage = mapGarageWithCoordinates({
            ...garage,
            availableSlots: Math.max(
                0,
                garage.availableSlots + Math.floor(Math.random() * 3 - 1)
            ),
        });

        res.json(updatedGarage);
    };

    // GET /parking/search
    search = async (req: Request, res: Response): Promise<void> => {
        const { q, lat, lng, minSlots, maxRate, features } = req.query;

        let results = Array.from(garageStore.values()).map((garage) => mapGarageWithCoordinates(garage));

        // Search by name or address
        if (q) {
            const query = (q as string).toLowerCase();
            results = results.filter(
                (g) =>
                    g.name.toLowerCase().includes(query) ||
                    g.address.toLowerCase().includes(query)
            );
        }

        // Filter by minimum available slots
        if (minSlots) {
            const min = parseInt(minSlots as string, 10);
            results = results.filter((g) => g.availableSlots >= min);
        }

        // Filter by max hourly rate
        if (maxRate) {
            const max = parseFloat(maxRate as string);
            results = results.filter((g) => g.hourlyRate <= max);
        }

        // Filter by features
        if (features) {
            const requestedFeatures = (features as string).split(',');
            results = results.filter((g) => {
                return requestedFeatures.every((f) => {
                    if (f === 'ev' && g.features.evChargers && g.features.evChargers > 0)
                        return true;
                    if (f === 'covered' && g.features.coveredParking) return true;
                    if (f === 'disabled' && g.features.disabledAccess) return true;
                    return false;
                });
            });
        }

        // If lat/lng provided, sort by distance
        if (lat && lng) {
            const latitude = parseFloat(lat as string);
            const longitude = parseFloat(lng as string);

            results = results
                .map((garage) => ({
                    ...garage,
                    distance: calculateDistance(latitude, longitude, garage.latitude, garage.longitude),
                }))
                .map((garage) =>
                    mapGarageWithCoordinates(
                        garage as Garage,
                        typeof garage.distance === 'number' ? garage.distance : undefined
                    )
                )
                .sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
        }

        res.json({
            garages: results,
            total: results.length,
        });
    };
}
