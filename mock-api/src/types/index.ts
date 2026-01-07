// User type
export interface User {
    id: string;
    phone?: string;
    email?: string;
    name: string;
    avatar?: string;
    provider?: 'phone' | 'email' | 'google' | 'apple';
    createdAt: string;
    updatedAt?: string;
}

// Vehicle type
export interface Vehicle {
    id: string;
    userId: string;
    plate: string;
    nickname?: string;
    make?: string;
    model?: string;
    color?: string;
    isDefault: boolean;
    createdAt: string;
}

// Garage/Parking location type
export interface Garage {
    id: string;
    name: string;
    address: string;
    location: {
        lat: number;
        lng: number;
    };
    entryMethod: 'ANPR' | 'QR' | 'TICKET';
    availableSlots: number;
    totalSlots: number;
    hourlyRate: number;
    maxTime?: number;
    currency: string;
    features: {
        evChargers?: number;
        security?: string;
        coveredParking?: boolean;
        disabledAccess?: boolean;
    };
    policies: {
        prepayRequired: boolean;
        badgeAfterHour?: number | null;
        overstayPenalty?: number;
    };
    operatingHours?: {
        open: string;
        close: string;
    };
    images?: string[];
    status?: 'available' | 'limited' | 'full';
    evChargers?: number;
}

// On-street zone type
export interface Zone {
    id: string;
    name: string;
    type: 'GREEN' | 'BLUE' | 'RED';
    location: {
        lat: number;
        lng: number;
    };
    hourlyRate: number;
    maxDuration: number;
    currency: string;
    restrictions?: string;
}

// Parking session type
export interface ParkingSession {
    id: string;
    userId: string;
    garageId?: string;
    zoneId?: string;
    garageName?: string;
    zoneName?: string;
    vehiclePlate: string;
    entryMethod: 'ANPR' | 'QR' | 'MANUAL';
    startTime: string;
    endTime?: string;
    status: 'active' | 'completed' | 'cancelled';
    hourlyRate: number;
    currency: string;
    elapsedMinutes?: number;
    totalFee?: number;
    paymentStatus?: 'pending' | 'paid' | 'failed';
}

// Wallet type
export interface Wallet {
    id: string;
    userId: string;
    balance: number;
    currency: string;
    updatedAt: string;
}

// Transaction type
export interface Transaction {
    id: string;
    walletId: string;
    userId: string;
    type: 'topup' | 'payment' | 'refund';
    amount: number;
    currency: string;
    description: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
    sessionId?: string;
    paymentMethodId?: string;
    paymentMethodType?: PaymentMethod['type'];
    receiptUrl?: string;
}

// Payment method type
export interface PaymentMethod {
    id: string;
    userId: string;
    type: 'card' | 'apple_pay' | 'google_pay';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
    createdAt: string;
}

// Subscription types
export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'week' | 'month' | 'year';
    benefits: string[];
    vehicleLimit: number;
    isPopular?: boolean;
}

export interface UserSubscription {
    id: string;
    userId: string;
    planId: string;
    status: 'active' | 'cancelled' | 'expired';
    startDate: string;
    endDate: string;
    autoRenew: boolean;
    nextBillingDate?: string;
}

// Notification type
export interface Notification {
    id: string;
    userId: string;
    title: string;
    body: string;
    type: 'session_start' | 'session_end' | 'payment' | 'promo' | 'system';
    read: boolean;
    data?: Record<string, unknown>;
    createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
}

// Auth types
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface OtpRequest {
    phone?: string;
    email?: string;
}

export interface OtpVerify {
    phone?: string;
    email?: string;
    otp: string;
}

// Express request extension
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
