import { useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '@store';
import { sessionService } from '@services/session/sessionService';
import { ParkingSession } from '@services/session/types';

const PAGE_SIZE = 20;

export const useSessionHistory = () => {
    const cachedHistory = useAppSelector((state) => state.session.history);
    const [history, setHistory] = useState<ParkingSession[]>(cachedHistory ?? []);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const load = useCallback(
        async (pageToLoad: number) => {
            setIsLoading(true);
            const items = await sessionService.getHistory(pageToLoad, PAGE_SIZE);
            if (pageToLoad === 1) {
                setHistory(items);
            } else {
                setHistory((prev) => [...prev, ...items]);
            }
            setHasMore(items.length === PAGE_SIZE);
            setIsLoading(false);
        },
        []
    );

    useEffect(() => {
        load(1);
    }, [load]);

    const loadMore = useCallback(() => {
        if (hasMore && !isLoading) {
            const next = page + 1;
            setPage(next);
            load(next);
        }
    }, [hasMore, isLoading, load, page]);

    return { history, isLoading, hasMore, loadMore, refresh: () => load(1) };
};
