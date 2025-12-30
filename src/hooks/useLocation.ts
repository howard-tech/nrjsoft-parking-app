import { useCallback, useEffect, useState } from 'react';
import Geolocation, { GeoCoordinates } from '@react-native-community/geolocation';
import { Platform } from 'react-native';
import {
    check,
    openSettings,
    Permission,
    PERMISSIONS,
    request,
    RESULTS,
} from 'react-native-permissions';

type PermissionStatus = 'unavailable' | 'denied' | 'blocked' | 'granted' | 'limited';

const PLATFORM_PERMISSION: Permission = Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    default: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
});

export const useLocation = () => {
    const [coords, setCoords] = useState<GeoCoordinates | null>(null);
    const [permission, setPermission] = useState<PermissionStatus>('unavailable');
    const [error, setError] = useState<string | null>(null);

    const requestPermission = useCallback(async (): Promise<PermissionStatus> => {
        if (!PLATFORM_PERMISSION) {
            setPermission('unavailable');
            return 'unavailable';
        }

        const status = await request(PLATFORM_PERMISSION);
        setPermission(status);
        if (status === RESULTS.BLOCKED) {
            setError('Location permission blocked. Please enable in settings.');
        } else {
            setError(null);
        }
        return status;
    }, []);

    const checkPermission = useCallback(async (): Promise<PermissionStatus> => {
        if (!PLATFORM_PERMISSION) {
            setPermission('unavailable');
            return 'unavailable';
        }

        const status = await check(PLATFORM_PERMISSION);
        setPermission(status);
        return status;
    }, []);

    const ensurePermission = useCallback(async (): Promise<boolean> => {
        const current = await checkPermission();
        if (current === RESULTS.GRANTED || current === RESULTS.LIMITED) {
            return true;
        }

        const next = await requestPermission();
        return next === RESULTS.GRANTED || next === RESULTS.LIMITED;
    }, [checkPermission, requestPermission]);

    const getCurrentPosition = useCallback(async (): Promise<GeoCoordinates | null> => {
        const allowed = await ensurePermission();
        if (!allowed) {
            setError('Location permission is required to show nearby parking.');
            return null;
        }

        return new Promise((resolve) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    setCoords(position.coords);
                    setError(null);
                    resolve(position.coords);
                },
                (err) => {
                    setError(err.message);
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000,
                }
            );
        });
    }, [ensurePermission]);

    const openPermissionSettings = useCallback(async () => openSettings(), []);

    useEffect(() => {
        // Prime permission state on mount
        checkPermission();
    }, [checkPermission]);

    return {
        coords,
        permission,
        error,
        checkPermission,
        requestPermission,
        getCurrentPosition,
        openPermissionSettings,
    };
};
