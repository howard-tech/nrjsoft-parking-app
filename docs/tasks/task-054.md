# TASK-054: API Simulation Features

## Task Overview

| Field | Value |
|-------|-------|
| Task ID | TASK-054 |
| Module | Backend / Mock API |
| Priority | High |
| Effort | 6h |
| Dependencies | TASK-052, TASK-053 |
| Status | 🔴 Not Started |

## Description

Add advanced simulation features to the Mock API including ANPR detection simulation, payment processing simulation, real-time updates, error simulation, and debugging tools. This enables comprehensive frontend testing without a real backend.

## Acceptance Criteria

- [ ] ANPR entry/exit detection simulation
- [ ] Payment processing with success/failure scenarios
- [ ] Real-time session cost updates via WebSocket
- [ ] Configurable error rates for testing
- [ ] Network latency simulation
- [ ] Admin dashboard for controlling simulations
- [ ] Webhook simulation for backend events

## Technical Implementation

### ANPR Simulation

```typescript
// src/services/anpr.service.ts
import { io } from '../app';
import { EventEmitter } from 'events';

interface ANPREvent {
  garageId: string;
  vehiclePlate: string;
  eventType: 'entry' | 'exit';
  timestamp: Date;
  cameraId: string;
}

class ANPRSimulator extends EventEmitter {
  private activePlates: Map<string, string> = new Map(); // plate -> garageId

  // Simulate vehicle entry detection
  async simulateEntry(garageId: string, vehiclePlate: string): Promise<ANPREvent> {
    const event: ANPREvent = {
      garageId,
      vehiclePlate: vehiclePlate.toUpperCase(),
      eventType: 'entry',
      timestamp: new Date(),
      cameraId: `cam_entry_${garageId}`,
    };

    this.activePlates.set(vehiclePlate, garageId);
    this.emit('anpr:entry', event);
    
    console.log(`🚗 ANPR Entry: ${vehiclePlate} at ${garageId}`);
    return event;
  }

  // Simulate vehicle exit detection
  async simulateExit(vehiclePlate: string): Promise<ANPREvent | null> {
    const garageId = this.activePlates.get(vehiclePlate);
    
    if (!garageId) {
      console.log(`⚠️ No active entry for ${vehiclePlate}`);
      return null;
    }

    const event: ANPREvent = {
      garageId,
      vehiclePlate: vehiclePlate.toUpperCase(),
      eventType: 'exit',
      timestamp: new Date(),
      cameraId: `cam_exit_${garageId}`,
    };

    this.activePlates.delete(vehiclePlate);
    this.emit('anpr:exit', event);
    
    console.log(`🚗 ANPR Exit: ${vehiclePlate} from ${garageId}`);
    return event;
  }

  // Get all active vehicles
  getActiveVehicles(): { plate: string; garageId: string }[] {
    return Array.from(this.activePlates.entries()).map(([plate, garageId]) => ({
      plate,
      garageId,
    }));
  }
}

export const anprSimulator = new ANPRSimulator();
```

### Payment Simulation

```typescript
// src/services/payment.service.ts

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  paymentMethod: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

interface PaymentConfig {
  successRate: number;  // 0-1, default 0.95
  processingDelay: number;  // ms, default 2000
  failureReasons: string[];
}

class PaymentSimulator {
  private config: PaymentConfig = {
    successRate: 0.95,
    processingDelay: 2000,
    failureReasons: [
      'insufficient_funds',
      'card_declined',
      'expired_card',
      'processing_error',
      'authentication_required',
    ],
  };

  private intents: Map<string, PaymentIntent> = new Map();

  setConfig(config: Partial<PaymentConfig>) {
    this.config = { ...this.config, ...config };
  }

  async createIntent(
    amount: number,
    currency: string,
    paymentMethod: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    const intent: PaymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      amount,
      currency,
      status: 'pending',
      paymentMethod,
      metadata: metadata || {},
      createdAt: new Date(),
    };

    this.intents.set(intent.id, intent);
    return intent;
  }

  async confirmPayment(intentId: string): Promise<PaymentIntent> {
    const intent = this.intents.get(intentId);
    
    if (!intent) {
      throw new Error('Payment intent not found');
    }

    intent.status = 'processing';

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, this.config.processingDelay));

    // Simulate success/failure based on config
    const isSuccess = Math.random() < this.config.successRate;

    if (isSuccess) {
      intent.status = 'succeeded';
      console.log(`💳 Payment succeeded: ${intentId} - €${intent.amount}`);
    } else {
      intent.status = 'failed';
      const reason = this.config.failureReasons[
        Math.floor(Math.random() * this.config.failureReasons.length)
      ];
      intent.metadata.failureReason = reason;
      console.log(`❌ Payment failed: ${intentId} - ${reason}`);
    }

    return intent;
  }

  getIntent(intentId: string): PaymentIntent | undefined {
    return this.intents.get(intentId);
  }
}

export const paymentSimulator = new PaymentSimulator();
```

### Real-time Session Updates

```typescript
// src/services/session-realtime.service.ts
import { io } from '../app';

class SessionRealtimeService {
  private updateIntervals: Map<string, NodeJS.Timer> = new Map();

  startSessionUpdates(sessionId: string, userId: string, hourlyRate: number, startTime: Date) {
    // Clear any existing interval
    this.stopSessionUpdates(sessionId);

    // Send updates every 30 seconds
    const interval = setInterval(() => {
      const elapsedMs = Date.now() - startTime.getTime();
      const elapsedMinutes = Math.floor(elapsedMs / 60000);
      const currentFee = Math.round((elapsedMinutes / 60) * hourlyRate * 100) / 100;

      const update = {
        sessionId,
        elapsedMinutes,
        currentFee,
        currency: 'EUR',
        timestamp: new Date().toISOString(),
      };

      io.to(`user_${userId}`).emit('SESSION_UPDATE', update);
      console.log(`📡 Session update: ${sessionId} - ${elapsedMinutes}min - €${currentFee}`);
    }, 30000);

    this.updateIntervals.set(sessionId, interval);
  }

  stopSessionUpdates(sessionId: string) {
    const interval = this.updateIntervals.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(sessionId);
    }
  }

  // Send wallet balance warning
  sendWalletWarning(userId: string, currentFee: number, walletBalance: number) {
    if (walletBalance - currentFee < 1) {
      io.to(`user_${userId}`).emit('WALLET_WARNING', {
        type: 'low_balance',
        currentFee,
        walletBalance,
        message: 'Your wallet balance is running low. Please top up.',
      });
    }
  }
}

export const sessionRealtimeService = new SessionRealtimeService();
```

### Error Simulation

```typescript
// src/middleware/error-simulation.ts
import { Request, Response, NextFunction } from 'express';

interface ErrorSimulationConfig {
  enabled: boolean;
  endpoints: {
    [path: string]: {
      errorRate: number;  // 0-1
      errorType: 'timeout' | 'server_error' | 'bad_request' | 'unauthorized';
      delay?: number;
    };
  };
}

let config: ErrorSimulationConfig = {
  enabled: false,
  endpoints: {},
};

export function setErrorSimulationConfig(newConfig: Partial<ErrorSimulationConfig>) {
  config = { ...config, ...newConfig };
}

export function errorSimulationMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!config.enabled) {
    return next();
  }

  const endpoint = Object.keys(config.endpoints).find(path => 
    req.path.includes(path)
  );

  if (!endpoint) {
    return next();
  }

  const { errorRate, errorType, delay } = config.endpoints[endpoint];

  if (Math.random() > errorRate) {
    return next();
  }

  console.log(`🔴 Simulating ${errorType} for ${req.path}`);

  switch (errorType) {
    case 'timeout':
      // Just hang forever (client will timeout)
      return;
    
    case 'server_error':
      return res.status(500).json({ error: 'Internal server error (simulated)' });
    
    case 'bad_request':
      return res.status(400).json({ error: 'Bad request (simulated)' });
    
    case 'unauthorized':
      return res.status(401).json({ error: 'Unauthorized (simulated)' });
    
    default:
      return next();
  }
}
```

### Admin Dashboard API

```typescript
// src/routes/admin.routes.ts
import { Router } from 'express';
import { anprSimulator } from '../services/anpr.service';
import { paymentSimulator } from '../services/payment.service';
import { setErrorSimulationConfig } from '../middleware/error-simulation';

const router = Router();

// Simulate ANPR entry
router.post('/simulate/anpr/entry', (req, res) => {
  const { garageId, vehiclePlate } = req.body;
  const event = anprSimulator.simulateEntry(garageId, vehiclePlate);
  res.json({ success: true, event });
});

// Simulate ANPR exit
router.post('/simulate/anpr/exit', (req, res) => {
  const { vehiclePlate } = req.body;
  const event = anprSimulator.simulateExit(vehiclePlate);
  res.json({ success: true, event });
});

// Get active vehicles
router.get('/simulate/anpr/active', (req, res) => {
  const vehicles = anprSimulator.getActiveVehicles();
  res.json({ vehicles });
});

// Configure payment simulation
router.post('/simulate/payment/config', (req, res) => {
  const { successRate, processingDelay } = req.body;
  paymentSimulator.setConfig({ successRate, processingDelay });
  res.json({ success: true, config: { successRate, processingDelay } });
});

// Configure error simulation
router.post('/simulate/errors/config', (req, res) => {
  setErrorSimulationConfig(req.body);
  res.json({ success: true });
});

// Reset all data
router.post('/reset', async (req, res) => {
  // Reset in-memory data
  // Re-seed database
  const { seedDatabase } = await import('../generators');
  await seedDatabase();
  res.json({ success: true, message: 'Data reset successfully' });
});

// Health & status
router.get('/status', (req, res) => {
  res.json({
    status: 'running',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    activeVehicles: anprSimulator.getActiveVehicles().length,
  });
});

export default router;
```

### Webhook Simulation

```typescript
// src/services/webhook.service.ts
import axios from 'axios';

interface WebhookConfig {
  enabled: boolean;
  url: string;
  secret: string;
}

class WebhookService {
  private config: WebhookConfig = {
    enabled: false,
    url: '',
    secret: '',
  };

  setConfig(config: Partial<WebhookConfig>) {
    this.config = { ...this.config, ...config };
  }

  async send(event: string, payload: any) {
    if (!this.config.enabled || !this.config.url) {
      return;
    }

    try {
      await axios.post(this.config.url, {
        event,
        payload,
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'X-Webhook-Secret': this.config.secret,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      console.log(`📤 Webhook sent: ${event}`);
    } catch (error) {
      console.error(`❌ Webhook failed: ${event}`, error.message);
    }
  }
}

export const webhookService = new WebhookService();

// Emit webhooks for events
anprSimulator.on('anpr:entry', (event) => {
  webhookService.send('ANPR_ENTRY', event);
});

anprSimulator.on('anpr:exit', (event) => {
  webhookService.send('ANPR_EXIT', event);
});
```

## Files to Create

| File | Purpose |
|------|---------|
| mock-api/src/services/anpr.service.ts | ANPR simulation |
| mock-api/src/services/payment.service.ts | Payment simulation |
| mock-api/src/services/session-realtime.service.ts | Real-time updates |
| mock-api/src/services/webhook.service.ts | Webhook simulation |
| mock-api/src/middleware/error-simulation.ts | Error simulation |
| mock-api/src/routes/admin.routes.ts | Admin API |

## Testing Checklist

- [ ] ANPR entry/exit simulation works
- [ ] Payment success/failure rates work correctly
- [ ] WebSocket updates are received by clients
- [ ] Error simulation triggers appropriate responses
- [ ] Admin endpoints control all simulations
- [ ] Data reset works correctly

## Related Tasks

- Previous: TASK-053 (Mock Data Generator)
- Enables: Frontend testing and development
