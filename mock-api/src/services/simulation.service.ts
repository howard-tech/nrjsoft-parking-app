import { Server as SocketIOServer } from 'socket.io';
import { ParkingSession } from '../types';
import { emitToUser } from './websocket.service';

export interface SimulationConfig {
    latencyMs: number;
    errorRate: number; // 0..1
    paymentSuccessRate: number; // 0..1
}

const config: SimulationConfig = {
    latencyMs: 200,
    errorRate: 0,
    paymentSuccessRate: 0.95,
};

let ioInstance: SocketIOServer | null = null;
const costIntervals: Map<string, NodeJS.Timeout> = new Map();

export function setSimulationSocket(io: SocketIOServer): void {
    ioInstance = io;
}

export function getSimulationConfig(): SimulationConfig {
    return { ...config };
}

export function updateSimulationConfig(updates: Partial<SimulationConfig>): SimulationConfig {
    if (typeof updates.latencyMs === 'number') {
        config.latencyMs = Math.max(0, updates.latencyMs);
    }
    if (typeof updates.errorRate === 'number') {
        config.errorRate = Math.max(0, Math.min(1, updates.errorRate));
    }
    if (typeof updates.paymentSuccessRate === 'number') {
        config.paymentSuccessRate = Math.max(0, Math.min(1, updates.paymentSuccessRate));
    }
    return getSimulationConfig();
}

export function shouldSimulateError(): boolean {
    return Math.random() < config.errorRate;
}

export function getSimulatedDelay(defaultDelay: number): number {
    return typeof config.latencyMs === 'number' ? config.latencyMs : defaultDelay;
}

export function startSessionCostTicker(session: ParkingSession): void {
    if (!ioInstance || !session.userId) return;
    // Clear any existing ticker for this session
    stopSessionCostTicker(session.id);

    const startTime = new Date(session.startTime).getTime();

    const interval = setInterval(() => {
        const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);
        const currentFee = Math.round((elapsedMinutes / 60) * session.hourlyRate * 100) / 100;
        emitToUser(ioInstance as SocketIOServer, session.userId, 'SESSION_COST_UPDATE', {
            sessionId: session.id,
            elapsedMinutes,
            currentFee,
            currency: session.currency,
            timestamp: new Date().toISOString(),
        });
    }, 30000); // every 30s to keep frontend responsive

    costIntervals.set(session.id, interval);
}

export function stopSessionCostTicker(sessionId: string): void {
    const handle = costIntervals.get(sessionId);
    if (handle) {
        clearInterval(handle);
        costIntervals.delete(sessionId);
    }
}
