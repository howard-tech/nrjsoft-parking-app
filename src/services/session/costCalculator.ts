import { ParkingSession } from './types';

export const calculateCurrentCost = (session: ParkingSession): number => {
    const startTime = new Date(session.startTime).getTime();
    const endTime = session.endTime ? new Date(session.endTime).getTime() : Date.now();

    const elapsedHours = Math.max(0, (endTime - startTime) / (1000 * 60 * 60));
    const baseCost = elapsedHours * (session.hourlyRate ?? 0);

    const minCost = session.minimumCharge ?? 0;
    const maxCost = session.maxDailyRate ?? Infinity;

    return Math.min(Math.max(baseCost, minCost), maxCost);
};
