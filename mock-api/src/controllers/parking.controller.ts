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

        // Simulate live availability for Downtown Central
        const downtownId = 'garage_downtown_central_champion';
        const downtown = garageStore.get(downtownId);
        if (downtown) {
            const delta = Math.floor(Math.random() * 5) - 2; // -2..+2
            const nextSlots = Math.max(0, Math.min(downtown.totalSlots ?? 50, (downtown.availableSlots ?? 0) + delta));
            const status = nextSlots === 0 ? 'full' : nextSlots < 5 ? 'limited' : 'available';
            garageStore.set(downtownId, { ...downtown, availableSlots: nextSlots, status });
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

        // Simulated availability logic remains visual-only, we don't persist it to store 
        // to avoid race conditions with generator in this simple mock
        const withUpdatedAvailability = nearbyGarages.map((garage) => ({
            ...garage,
            availableSlots: Math.max(
                0,
                garage.availableSlots + Math.floor(Math.random() * 5 - 2)
            ),
        }));

        let sorted = withUpdatedAvailability;
        switch (sortBy) {
            case 'nearest':
                sorted = [...withUpdatedAvailability].sort(
                    (a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0)
                );
                break;
            case 'cheapest':
                sorted = [...withUpdatedAvailability].sort(
                    (a, b) => (a.hourlyRate ?? Number.MAX_VALUE) - (b.hourlyRate ?? Number.MAX_VALUE)
                );
                break;
            case 'ev_ready':
                sorted = [...withUpdatedAvailability].sort(
                    (a, b) =>
                        (b.features?.evChargers ?? b.evChargers ?? 0) -
                        (a.features?.evChargers ?? a.evChargers ?? 0)
                );
                break;
            case 'max_time':
                sorted = [...withUpdatedAvailability].sort(
                    (a, b) => (b.maxTime ?? 0) - (a.maxTime ?? 0)
                );
                break;
            default:
                break;
        }

        await delay(600);

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
