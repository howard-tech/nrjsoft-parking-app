import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@store';
import { fetchActiveSession } from '@store/slices/sessionSlice';
import { sessionService } from '@services/session/sessionService';

export const useActiveSession = () => {
    const dispatch = useAppDispatch();
    const { activeSession, isLoading, error } = useAppSelector((state) => state.session);

    useEffect(() => {
        dispatch(fetchActiveSession());
    }, [dispatch]);

    const refresh = useCallback(async () => {
        await sessionService.getActiveSession();
    }, []);

    const extend = useCallback(
        async (minutes: number) => {
            if (activeSession) {
                return sessionService.extendSession(activeSession.id, minutes);
            }
            return null;
        },
        [activeSession]
    );

    const currentCost = useMemo(
        () => (activeSession ? sessionService.calculateCurrentCost(activeSession) : 0),
        [activeSession]
    );

    return {
        session: activeSession,
        isLoading,
        error,
        currentCost,
        refresh,
        extend,
    };
};
