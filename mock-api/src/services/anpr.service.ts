import { ParkingSession } from '../types';
import {
    findVehicleByPlate,
    garageStore,
    sessionStore,
    userStore,
    getAnyUser,
} from './data.store';
import { startSessionCostTicker, stopSessionCostTicker } from './simulation.service';

export interface ANPREvent {
    garageId: string;
    vehiclePlate: string;
    eventType: 'entry' | 'exit';
    timestamp: string;
    cameraId: string;
    sessionId?: string;
}

class ANPRSimulator {
    private activePlates: Map<string, string> = new Map(); // plate -> sessionId

    simulateEntry(garageId: string, vehiclePlate: string): ANPREvent {
        const garage = garageStore.get(garageId);
        if (!garage) {
            throw new Error('Garage not found');
        }

        const normalizedPlate = vehiclePlate.trim().toUpperCase();
        const vehicle = findVehicleByPlate(normalizedPlate);
        const user = vehicle ? userStore.get(vehicle.userId) : getAnyUser();

        if (!user) {
            throw new Error('No users available to attach session');
        }

        // Check existing active session for this plate
        const existingSession = Array.from(sessionStore.values()).find(
            (s) => s.vehiclePlate.toUpperCase() === normalizedPlate && s.status === 'active'
        );

        if (existingSession) {
            this.activePlates.set(normalizedPlate, existingSession.id);
            return {
                garageId,
                vehiclePlate: normalizedPlate,
                eventType: 'entry',
                timestamp: new Date().toISOString(),
                cameraId: `cam_entry_${garageId}`,
                sessionId: existingSession.id,
            };
        }

        const session: ParkingSession = {
            id: `session_${Date.now()}`,
            userId: user.id,
            garageId,
            garageName: garage.name,
            vehiclePlate: normalizedPlate,
            entryMethod: 'ANPR',
            startTime: new Date().toISOString(),
            status: 'active',
            hourlyRate: garage.hourlyRate,
            currency: garage.currency,
        };

        sessionStore.set(session.id, session);
        this.activePlates.set(normalizedPlate, session.id);
        startSessionCostTicker(session);

        return {
            garageId,
            vehiclePlate: normalizedPlate,
            eventType: 'entry',
            timestamp: session.startTime,
            cameraId: `cam_entry_${garageId}`,
            sessionId: session.id,
        };
    }

    simulateExit(vehiclePlate: string): ANPREvent {
        const normalizedPlate = vehiclePlate.trim().toUpperCase();
        const sessionId = this.activePlates.get(normalizedPlate);

        const session =
            sessionId && sessionStore.get(sessionId)
                ? sessionStore.get(sessionId)
                : Array.from(sessionStore.values()).find(
                      (s) => s.vehiclePlate.toUpperCase() === normalizedPlate && s.status === 'active'
                  );

        if (!session || !session.garageId) {
            throw new Error('Active session not found for plate');
        }

        const endTime = new Date();
        const elapsedMinutes = Math.floor(
            (endTime.getTime() - new Date(session.startTime).getTime()) / 60000
        );
        const totalFee = Math.round((elapsedMinutes / 60) * session.hourlyRate * 100) / 100;

        const completedSession: ParkingSession = {
            ...session,
            status: 'completed',
            endTime: endTime.toISOString(),
            elapsedMinutes,
            totalFee,
            paymentStatus: 'paid',
        };

        sessionStore.set(completedSession.id, completedSession);
        this.activePlates.delete(normalizedPlate);
        stopSessionCostTicker(completedSession.id);

        return {
            garageId: session.garageId,
            vehiclePlate: normalizedPlate,
            eventType: 'exit',
            timestamp: endTime.toISOString(),
            cameraId: `cam_exit_${session.garageId}`,
            sessionId: completedSession.id,
        };
    }

    getActiveVehicles(): { plate: string; sessionId: string }[] {
        return Array.from(this.activePlates.entries()).map(([plate, sessionId]) => ({
            plate,
            sessionId,
        }));
    }
}

export const anprSimulator = new ANPRSimulator();
