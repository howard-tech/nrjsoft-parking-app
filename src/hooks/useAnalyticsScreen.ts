import { useEffect, useRef } from 'react';
import { useIsFocused, useRoute } from '@react-navigation/native';
import { analyticsService } from '@services/analytics';

export const useAnalyticsScreen = (screenName?: string) => {
    const isFocused = useIsFocused();
    const route = useRoute();
    const hasLogged = useRef(false);

    const name = screenName || route.name;

    useEffect(() => {
        if (isFocused && !hasLogged.current) {
            analyticsService.logScreenView(name);
            hasLogged.current = true;
        }

        if (!isFocused) {
            hasLogged.current = false;
        }
    }, [isFocused, name]);
};
