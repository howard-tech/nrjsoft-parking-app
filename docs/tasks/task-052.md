# TASK-052: Mock Backend API Setup

## Task Overview

| Field | Value |
|-------|-------|
| Task ID | TASK-052 |
| Module | Backend / Mock API |
| Priority | Critical |
| Effort | 12h |
| Dependencies | None |
| Status | 🟢 Completed |

## Description

Set up a complete Mock Backend API using Node.js (Express) that simulates all NRJSoft backend endpoints. This allows frontend development to proceed independently while the real backend is being developed. The mock server will include realistic data, proper response delays, and error simulation.

## Acceptance Criteria

- [ ] Express server running on configurable port (default 3001)
- [ ] All API endpoints from technical proposal implemented
- [ ] Realistic mock data with proper data structures
- [ ] JWT-based authentication simulation
- [ ] WebSocket support for real-time session updates
- [ ] Request/response logging for debugging
- [ ] Configurable response delays to simulate network latency
- [ ] Error simulation endpoints for testing error handling
- [ ] Swagger/OpenAPI documentation
- [ ] Docker container for easy deployment
- [ ] Hot reload during development

## Technical Implementation

### Project Structure

```
mock-api/
├── src/
│   ├── index.ts                 # Entry point
│   ├── app.ts                   # Express app setup
│   ├── config/
│   │   └── index.ts             # Configuration
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification
│   │   ├── delay.ts             # Response delay simulation
│   │   ├── logger.ts            # Request logging
│   │   └── errorHandler.ts      # Error handling
│   ├── routes/
│   │   ├── index.ts             # Route aggregator
│   │   ├── auth.routes.ts       # Authentication routes
│   │   ├── parking.routes.ts    # Parking/garage routes
│   │   ├── session.routes.ts    # Parking session routes
│   │   ├── wallet.routes.ts     # Wallet routes
│   │   ├── payment.routes.ts    # Payment routes
│   │   ├── onstreet.routes.ts   # On-street parking routes
│   │   ├── user.routes.ts       # User profile routes
│   │   └── notification.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── parking.controller.ts
│   │   ├── session.controller.ts
│   │   ├── wallet.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── onstreet.controller.ts
│   │   └── user.controller.ts
│   ├── services/
│   │   ├── jwt.service.ts       # JWT token generation
│   │   ├── otp.service.ts       # OTP simulation
│   │   └── websocket.service.ts # WebSocket for real-time
│   ├── data/
│   │   ├── users.json           # Mock users
│   │   ├── garages.json         # Mock garages
│   │   ├── zones.json           # On-street zones
│   │   ├── sessions.json        # Parking sessions
│   │   └── transactions.json    # Payment transactions
│   └── types/
│       └── index.ts             # TypeScript types
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### Express App Setup

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

import { authMiddleware } from './middleware/auth';
import { delayMiddleware } from './middleware/delay';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { setupWebSocket } from './services/websocket.service';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*' }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(delayMiddleware);

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

// WebSocket
setupWebSocket(io);

export { app, httpServer, io };
```

### Authentication Routes

```typescript
// src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const controller = new AuthController();

// POST /auth/otp-request
router.post('/otp-request', controller.requestOtp);

// POST /auth/otp-verify
router.post('/otp-verify', controller.verifyOtp);

// POST /auth/social/google
router.post('/social/google', controller.googleAuth);

// POST /auth/social/apple
router.post('/social/apple', controller.appleAuth);

// POST /auth/refresh
router.post('/refresh', controller.refreshToken);

// POST /auth/logout
router.post('/logout', controller.logout);

export default router;
```

### Auth Controller

```typescript
// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { JwtService } from '../services/jwt.service';
import { OtpService } from '../services/otp.service';
import users from '../data/users.json';

export class AuthController {
  private jwtService = new JwtService();
  private otpService = new OtpService();

  requestOtp = async (req: Request, res: Response) => {
    const { phone, email } = req.body;
    
    if (!phone && !email) {
      return res.status(400).json({ error: 'Phone or email required' });
    }

    // Generate OTP (always 123456 for testing)
    const otp = this.otpService.generate(phone || email);
    
    res.json({
      success: true,
      message: 'OTP sent successfully',
      // In dev mode, return OTP for convenience
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  };

  verifyOtp = async (req: Request, res: Response) => {
    const { phone, email, otp } = req.body;
    const identifier = phone || email;

    // Accept 123456 as valid OTP in mock
    if (otp !== '123456' && !this.otpService.verify(identifier, otp)) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Find or create user
    let user = users.find(u => u.phone === phone || u.email === email);
    if (!user) {
      user = {
        id: `user_${Date.now()}`,
        phone,
        email,
        name: 'New User',
        createdAt: new Date().toISOString()
      };
    }

    const accessToken = this.jwtService.generateAccessToken(user);
    const refreshToken = this.jwtService.generateRefreshToken(user);

    res.json({
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user
    });
  };

  googleAuth = async (req: Request, res: Response) => {
    const { idToken } = req.body;
    
    // Mock Google auth - just create a user
    const user = {
      id: 'user_google_123',
      email: 'google.user@gmail.com',
      name: 'Google User',
      provider: 'google'
    };

    const accessToken = this.jwtService.generateAccessToken(user);
    const refreshToken = this.jwtService.generateRefreshToken(user);

    res.json({ accessToken, refreshToken, user });
  };

  appleAuth = async (req: Request, res: Response) => {
    const { identityToken } = req.body;
    
    const user = {
      id: 'user_apple_123',
      email: 'apple.user@icloud.com',
      name: 'Apple User',
      provider: 'apple'
    };

    const accessToken = this.jwtService.generateAccessToken(user);
    const refreshToken = this.jwtService.generateRefreshToken(user);

    res.json({ accessToken, refreshToken, user });
  };

  refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    
    try {
      const decoded = this.jwtService.verifyRefreshToken(refreshToken);
      const accessToken = this.jwtService.generateAccessToken(decoded);
      
      res.json({ accessToken, expiresIn: 3600 });
    } catch (error) {
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  };

  logout = async (req: Request, res: Response) => {
    res.json({ success: true });
  };
}
```

### Mock Garages Data

```json
// src/data/garages.json
[
  {
    "id": "garage_001",
    "name": "NRJ Downtown Hub",
    "address": "23 Marina Blvd, Ruse",
    "location": {
      "lat": 43.8356,
      "lng": 25.9657
    },
    "entryMethod": "ANPR",
    "availableSlots": 45,
    "totalSlots": 120,
    "hourlyRate": 4.90,
    "maxTime": 480,
    "currency": "EUR",
    "features": {
      "evChargers": 4,
      "security": "ANPR + patrols",
      "coveredParking": true
    },
    "policies": {
      "prepayRequired": false,
      "badgeAfterHour": null,
      "overstayPenalty": 15
    },
    "operatingHours": {
      "open": "00:00",
      "close": "24:00"
    },
    "images": [
      "https://example.com/garage1.jpg"
    ]
  },
  {
    "id": "garage_002",
    "name": "Danube Plaza Garage",
    "address": "6 Freedom Sq, Ruse",
    "location": {
      "lat": 43.8489,
      "lng": 25.9534
    },
    "entryMethod": "QR",
    "availableSlots": 12,
    "totalSlots": 80,
    "hourlyRate": 5.20,
    "maxTime": 240,
    "currency": "EUR",
    "features": {
      "evChargers": 4,
      "security": "ANPR + patrols",
      "coveredParking": true
    },
    "policies": {
      "prepayRequired": false,
      "badgeAfterHour": 22,
      "overstayPenalty": 12
    }
  }
]
```

### Session Controller with WebSocket

```typescript
// src/controllers/session.controller.ts
import { Request, Response } from 'express';
import { io } from '../app';
import sessions from '../data/sessions.json';

let activeSessions: Map<string, any> = new Map();

export class SessionController {
  // GET /sessions/active
  getActive = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const session = Array.from(activeSessions.values())
      .find(s => s.userId === userId && s.status === 'active');
    
    if (!session) {
      return res.json({ hasActiveSession: false });
    }

    // Calculate current fee
    const elapsedMinutes = Math.floor(
      (Date.now() - new Date(session.startTime).getTime()) / 60000
    );
    const currentFee = (elapsedMinutes / 60) * session.hourlyRate;

    res.json({
      hasActiveSession: true,
      session: {
        ...session,
        elapsedMinutes,
        currentFee: Math.round(currentFee * 100) / 100
      }
    });
  };

  // POST /sessions (Start session - simulates ANPR detection)
  startSession = async (req: Request, res: Response) => {
    const { garageId, vehiclePlate, entryMethod } = req.body;
    const userId = req.user?.id;

    const session = {
      id: `session_${Date.now()}`,
      garageId,
      garageName: 'NRJ Downtown Hub',
      userId,
      vehiclePlate,
      entryMethod,
      startTime: new Date().toISOString(),
      status: 'active',
      hourlyRate: 4.90,
      currency: 'EUR'
    };

    activeSessions.set(session.id, session);

    // Emit via WebSocket
    io.to(`user_${userId}`).emit('SESSION_START', session);

    res.status(201).json(session);
  };

  // POST /sessions/:id/end
  endSession = async (req: Request, res: Response) => {
    const { id } = req.params;
    const session = activeSessions.get(id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const endTime = new Date();
    const elapsedMinutes = Math.floor(
      (endTime.getTime() - new Date(session.startTime).getTime()) / 60000
    );
    const totalFee = Math.round((elapsedMinutes / 60) * session.hourlyRate * 100) / 100;

    const completedSession = {
      ...session,
      endTime: endTime.toISOString(),
      status: 'completed',
      elapsedMinutes,
      totalFee
    };

    activeSessions.delete(id);

    // Emit via WebSocket
    io.to(`user_${session.userId}`).emit('SESSION_END', completedSession);

    res.json(completedSession);
  };

  // GET /sessions/:id
  getSession = async (req: Request, res: Response) => {
    const { id } = req.params;
    const session = activeSessions.get(id) || sessions.find(s => s.id === id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  };

  // GET /sessions/history
  getHistory = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;

    const userSessions = sessions.filter(s => s.userId === userId);
    const paginated = userSessions.slice(
      (Number(page) - 1) * Number(limit),
      Number(page) * Number(limit)
    );

    res.json({
      sessions: paginated,
      total: userSessions.length,
      page: Number(page),
      totalPages: Math.ceil(userSessions.length / Number(limit))
    });
  };
}
```

### WebSocket Service

```typescript
// src/services/websocket.service.ts
import { Server as SocketIOServer, Socket } from 'socket.io';
import { JwtService } from './jwt.service';

const jwtService = new JwtService();

export function setupWebSocket(io: SocketIOServer) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwtService.verifyAccessToken(token);
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.id;
    console.log(`User connected: ${userId}`);

    // Join user's room for targeted messages
    socket.join(`user_${userId}`);

    // Handle session updates request
    socket.on('REQUEST_SESSION_UPDATE', (sessionId) => {
      // Simulate periodic updates
      const interval = setInterval(() => {
        socket.emit('SESSION_UPDATE', {
          sessionId,
          elapsedMinutes: Math.floor((Date.now() - Date.now()) / 60000),
          currentFee: 0.00,
          timestamp: new Date().toISOString()
        });
      }, 60000); // Update every minute

      socket.on('disconnect', () => clearInterval(interval));
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });
}
```

### Docker Setup

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY src/data ./dist/data

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  mock-api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
      - JWT_SECRET=mock-jwt-secret-key
      - RESPONSE_DELAY=200
    volumes:
      - ./src/data:/app/dist/data
    restart: unless-stopped
```

### Package.json

```json
{
  "name": "nrjsoft-mock-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "docker:build": "docker build -t nrjsoft-mock-api .",
    "docker:run": "docker-compose up -d"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "socket.io": "^4.7.2",
    "swagger-ui-express": "^5.0.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.10.5",
    "@types/swagger-ui-express": "^4.1.6",
    "@types/uuid": "^9.0.7",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

## Files to Create

| File | Purpose |
|------|---------|
| mock-api/src/index.ts | Entry point |
| mock-api/src/app.ts | Express app setup |
| mock-api/src/routes/*.ts | API routes |
| mock-api/src/controllers/*.ts | Request handlers |
| mock-api/src/services/*.ts | Business logic |
| mock-api/src/data/*.json | Mock data files |
| mock-api/src/middleware/*.ts | Express middleware |
| mock-api/Dockerfile | Docker image |
| mock-api/docker-compose.yml | Docker compose |
| mock-api/swagger.json | API documentation |

## API Endpoints Covered

### Authentication
- POST /api/v1/auth/otp-request
- POST /api/v1/auth/otp-verify
- POST /api/v1/auth/social/google
- POST /api/v1/auth/social/apple
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout

### User
- GET /api/v1/me
- PUT /api/v1/me
- GET /api/v1/me/vehicles
- POST /api/v1/me/vehicles
- DELETE /api/v1/me/vehicles/:id

### Parking
- GET /api/v1/parking/nearby
- GET /api/v1/parking/:garageId
- GET /api/v1/parking/search

### Sessions
- GET /api/v1/sessions/active
- POST /api/v1/sessions
- GET /api/v1/sessions/:id
- POST /api/v1/sessions/:id/end
- POST /api/v1/sessions/:id/extend
- GET /api/v1/sessions/history

### Wallet
- GET /api/v1/wallet
- GET /api/v1/wallet/transactions
- POST /api/v1/wallet/topup-intent
- GET /api/v1/wallet/topup-status

### Payment
- GET /api/v1/payment-methods
- POST /api/v1/payment-methods
- DELETE /api/v1/payment-methods/:id
- POST /api/v1/payments/intents
- POST /api/v1/payments/confirm

### On-Street
- GET /api/v1/onstreet/zones
- GET /api/v1/onstreet/zones/:id
- POST /api/v1/onstreet/quote
- POST /api/v1/onstreet/sessions
- POST /api/v1/onstreet/sessions/:id/extend
- POST /api/v1/onstreet/sessions/:id/stop

### Notifications
- GET /api/v1/notifications
- PUT /api/v1/notifications/:id/read
- POST /api/v1/devices/register

## Testing Checklist

- [ ] All endpoints return proper HTTP status codes
- [ ] JWT authentication works correctly
- [ ] WebSocket connections work for session updates
- [ ] Mock data is realistic and complete
- [ ] Response delays simulate network latency
- [ ] Error simulation endpoints work
- [ ] Swagger documentation is accurate
- [ ] Docker container builds and runs
- [ ] Hot reload works in development

## Related Tasks

- Previous: TASK-007 (API Client)
- Enables: All frontend development tasks
