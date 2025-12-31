import { ParkingSession, PricingRule } from './types';

export const calculateCurrentCost = (session: ParkingSession): number => {
    const elapsedSeconds = Math.max(
        0,
        (session.endTime ? new Date(session.endTime).getTime() : Date.now()) -
            new Date(session.startTime).getTime()
    );
    const breakdown = calculateSessionCost(session, elapsedSeconds / 3600);
    return breakdown.totalCost;
};

export const calculateSessionCost = (session: ParkingSession, elapsedHours: number) => {
    const pricingRules = session.pricingRules ?? [];
    let baseCost = 0;
    const appliedRules: string[] = [];

    if (pricingRules.length > 0) {
        baseCost = calculateTieredCost(elapsedHours, pricingRules, appliedRules);
    } else {
        baseCost = elapsedHours * (session.hourlyRate ?? 0);
        appliedRules.push(`Standard rate: ${session.hourlyRate ?? 0}/hr`);
    }

    if (session.minimumCharge && baseCost < session.minimumCharge) {
        baseCost = session.minimumCharge;
        appliedRules.push(`Minimum charge: ${session.minimumCharge}`);
    }

    if (session.maxDailyRate && baseCost > session.maxDailyRate) {
        baseCost = session.maxDailyRate;
        appliedRules.push(`Max daily rate: ${session.maxDailyRate}`);
    }

    const totalCost = Math.round(baseCost * 100) / 100;
    return {
        baseCost,
        totalCost,
        currency: session.currency ?? 'EUR',
        appliedRules,
    };
};

const calculateTieredCost = (hours: number, rules: PricingRule[], appliedRules: string[]): number => {
    let totalCost = 0;
    let remainingHours = hours;
    const sorted = [...rules].sort((a, b) => a.startHour - b.startHour);

    for (let i = 0; i < sorted.length; i++) {
        const rule = sorted[i];
        const nextRule = sorted[i + 1];
        const tierEnd = nextRule?.startHour ?? Infinity;

        if (hours > rule.startHour) {
            const hoursInTier = Math.min(remainingHours, tierEnd - rule.startHour);
            const tierCost = hoursInTier * rule.rate;
            totalCost += tierCost;
            remainingHours -= hoursInTier;
            appliedRules.push(`${rule.name}: ${hoursInTier.toFixed(2)}h x ${rule.rate}/hr`);
        }

        if (remainingHours <= 0) {
            break;
        }
    }

    return totalCost;
};
