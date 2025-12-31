export type SessionStatus = 'active' | 'pending' | 'completed' | 'expired';

export interface PricingRule {
    name: string;
    startHour: number;
    rate: number;
}

export interface ParkingSession {
    id: string;
    garageId: string;
    garageName?: string;
    zoneName?: string;
    address?: string;
    startTime: string;
    endTime?: string;
    hourlyRate?: number;
    minimumCharge?: number;
    maxDailyRate?: number;
    vehiclePlate?: string;
    entryMethod?: 'ANPR' | 'QR';
    status: SessionStatus;
    currentCost?: number;
    pricingRules?: PricingRule[];
    currency?: string;
}

export interface SessionReceipt {
    sessionId: string;
    finalCost: number;
    durationMinutes: number;
    receiptUrl?: string;
}
