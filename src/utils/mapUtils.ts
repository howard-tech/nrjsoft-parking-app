import { Region } from 'react-native-maps';

// Basic Haversine formula for distance in meters
export const distanceInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371e3; // meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

export const formatDistance = (meters?: number): string => {
    if (meters === undefined || Number.isNaN(meters)) {
        return '';
    }
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
};

export interface ClusterPoint<T> {
    id: string;
    coordinate: { latitude: number; longitude: number };
    count: number;
    items: T[];
}

/**
 * Lightweight grid-based clustering to avoid extra dependencies.
 * It groups points into buckets based on the current map region span.
 */
export const clusterItems = <T extends { latitude: number; longitude: number }>(
    items: T[],
    region?: Region
): Array<{ type: 'cluster'; cluster: ClusterPoint<T> } | { type: 'item'; item: T }> => {
    if (!region || items.length <= 1) {
        return items.map((item) => ({ type: 'item', item }));
    }

    const latStep = Math.max(region.latitudeDelta / 8, 0.005);
    const lonStep = Math.max(region.longitudeDelta / 8, 0.005);

    const buckets = new Map<
        string,
        { sumLat: number; sumLon: number; count: number; items: T[] }
    >();

    items.forEach((item) => {
        const latBucket = Math.floor(item.latitude / latStep);
        const lonBucket = Math.floor(item.longitude / lonStep);
        const key = `${latBucket}:${lonBucket}`;

        const existing = buckets.get(key);
        if (existing) {
            existing.sumLat += item.latitude;
            existing.sumLon += item.longitude;
            existing.count += 1;
            existing.items.push(item);
        } else {
            buckets.set(key, {
                sumLat: item.latitude,
                sumLon: item.longitude,
                count: 1,
                items: [item],
            });
        }
    });

    const result: Array<{ type: 'cluster'; cluster: ClusterPoint<T> } | { type: 'item'; item: T }> = [];

    buckets.forEach((bucket, key) => {
        if (bucket.count === 1) {
            result.push({ type: 'item', item: bucket.items[0] });
            return;
        }

        result.push({
            type: 'cluster',
            cluster: {
                id: `cluster-${key}`,
                coordinate: {
                    latitude: bucket.sumLat / bucket.count,
                    longitude: bucket.sumLon / bucket.count,
                },
                count: bucket.count,
                items: bucket.items,
            },
        });
    });

    return result;
};
