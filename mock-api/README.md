# NRJSoft Parking - Mock API

Mock Backend API for NRJSoft Parking Mobile Application development.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Server will be running at http://localhost:3001
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run with Docker Compose |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/otp-request` | Request OTP |
| POST | `/api/v1/auth/otp-verify` | Verify OTP (use `123456`) |
| POST | `/api/v1/auth/social/google` | Google Sign-In |
| POST | `/api/v1/auth/social/apple` | Apple Sign-In |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout |

### User Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/me` | Get user profile |
| PUT | `/api/v1/me` | Update user profile |
| GET | `/api/v1/me/vehicles` | Get user vehicles |
| POST | `/api/v1/me/vehicles` | Add vehicle |
| PUT | `/api/v1/me/vehicles/:id` | Update vehicle |
| DELETE | `/api/v1/me/vehicles/:id` | Delete vehicle |

### Parking / Garages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/parking/nearby` | Get nearby garages |
| GET | `/api/v1/parking/search` | Search garages |
| GET | `/api/v1/parking/:garageId` | Get garage details |

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/sessions/active` | Get active session |
| POST | `/api/v1/sessions` | Start parking session |
| GET | `/api/v1/sessions/:id` | Get session details |
| POST | `/api/v1/sessions/:id/end` | End session |
| POST | `/api/v1/sessions/:id/extend` | Extend session |
| GET | `/api/v1/sessions/history` | Get session history |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/wallet` | Get wallet balance |
| GET | `/api/v1/wallet/transactions` | Get transactions |
| POST | `/api/v1/wallet/topup-intent` | Create top-up intent |
| POST | `/api/v1/wallet/topup-confirm` | Confirm top-up |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/payment-methods` | Get payment methods |
| POST | `/api/v1/payment-methods` | Add payment method |
| DELETE | `/api/v1/payment-methods/:id` | Delete payment method |
| POST | `/api/v1/payments/intents` | Create payment intent |
| POST | `/api/v1/payments/confirm` | Confirm payment |

### On-Street Parking
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/onstreet/zones` | Get parking zones |
| GET | `/api/v1/onstreet/zones/:id` | Get zone details |
| POST | `/api/v1/onstreet/quote` | Get parking quote |
| POST | `/api/v1/onstreet/sessions` | Start on-street session |
| GET | `/api/v1/onstreet/sessions/active` | Get active session |
| POST | `/api/v1/onstreet/sessions/:id/extend` | Extend session |
| POST | `/api/v1/onstreet/sessions/:id/stop` | Stop session |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | Get notifications |
| PUT | `/api/v1/notifications/:id/read` | Mark as read |
| PUT | `/api/v1/notifications/read-all` | Mark all as read |

### Devices
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/devices/register` | Register device |
| DELETE | `/api/v1/devices/unregister` | Unregister device |

## Authentication

Use OTP `123456` for testing. After verification, you'll receive a JWT token.

```bash
# Request OTP
curl -X POST http://localhost:3001/api/v1/auth/otp-request \
  -H "Content-Type: application/json" \
  -d '{"phone": "+359888123456"}'

# Verify OTP
curl -X POST http://localhost:3001/api/v1/auth/otp-verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "+359888123456", "otp": "123456"}'
```

Use the returned `accessToken` in subsequent requests:

```bash
curl http://localhost:3001/api/v1/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## WebSocket

Connect to WebSocket for real-time updates:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: { token: 'YOUR_ACCESS_TOKEN' }
});

socket.on('SESSION_START', (data) => console.log('Session started:', data));
socket.on('SESSION_END', (data) => console.log('Session ended:', data));
socket.on('SESSION_UPDATE', (data) => console.log('Session update:', data));
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `JWT_SECRET` | `mock-jwt-...` | JWT signing secret |
| `JWT_EXPIRES_IN` | `1h` | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token expiry |
| `RESPONSE_DELAY` | `200` | Simulated latency (ms) |
| `NODE_ENV` | `development` | Environment |

## Mock Data

Mock data is stored in `src/data/`:
- `users.json` - User accounts
- `vehicles.json` - User vehicles
- `garages.json` - Parking garages
- `zones.json` - On-street zones
- `sessions.json` - Parking history
- `wallets.json` - Wallet balances
- `transactions.json` - Transaction history
- `payment-methods.json` - Payment methods
- `notifications.json` - Notifications

## Docker

```bash
# Build and run
npm run docker:build
npm run docker:run

# Or use docker-compose directly
docker-compose up -d
```
