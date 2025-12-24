import { getSimulationConfig } from './simulation.service';

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed';

export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod?: string;
    metadata?: Record<string, unknown>;
    failureReason?: string;
    createdAt: string;
}

class PaymentSimulator {
    private intents: Map<string, PaymentIntent> = new Map();

    createIntent(amount: number, currency: string, metadata?: Record<string, unknown>): PaymentIntent {
        const intent: PaymentIntent = {
            id: `pi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            amount,
            currency,
            status: 'pending',
            metadata,
            createdAt: new Date().toISOString(),
        };
        this.intents.set(intent.id, intent);
        return intent;
    }

    async confirmIntent(intentId: string, paymentMethod?: string): Promise<PaymentIntent> {
        const intent = this.intents.get(intentId);
        if (!intent) {
            throw new Error('Payment intent not found');
        }

        intent.status = 'processing';
        intent.paymentMethod = paymentMethod;
        const { paymentSuccessRate } = getSimulationConfig();

        // lightweight delay to mimic processing
        await new Promise((resolve) => setTimeout(resolve, 300));

        const success = Math.random() < paymentSuccessRate;
        if (success) {
            intent.status = 'succeeded';
        } else {
            intent.status = 'failed';
            intent.failureReason = this.randomFailureReason();
        }

        this.intents.set(intent.id, intent);
        return intent;
    }

    getIntent(intentId: string): PaymentIntent | undefined {
        return this.intents.get(intentId);
    }

    private randomFailureReason(): string {
        const reasons = [
            'insufficient_funds',
            'card_declined',
            'processing_error',
            'authentication_required',
            'expired_card',
        ];
        return reasons[Math.floor(Math.random() * reasons.length)];
    }
}

export const paymentSimulator = new PaymentSimulator();
