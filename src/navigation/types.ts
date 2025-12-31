import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
    Tutorial: undefined;
    Login: undefined;
    OTPVerification: { phone?: string; email?: string };
};

// Home Stack (Smart Map)
export type HomeStackParamList = {
    SmartMap: undefined;
    GarageDetail: { garageId: string };
    QRScanner: { garageId: string };
    Search: undefined;
};

// Session Stack
export type SessionStackParamList = {
    ActiveSession: undefined;
    SessionHistory: undefined;
    SessionDetail: { sessionId: string };
};

// Wallet/Payment Stack
export type WalletStackParamList = {
    WalletHome: undefined;
    TopUp: undefined;
    PaymentMethods: undefined;
    AddPaymentMethod: undefined;
    Subscriptions: undefined;
};

// History Stack
export type HistoryStackParamList = {
    HistoryList: undefined;
    HistoryDetail: { sessionId: string };
    Receipt: { transactionId: string };
};

// Account Stack
export type AccountStackParamList = {
    AccountHome: undefined;
    Profile: undefined;
    Vehicles: undefined;
    AddVehicle: undefined;
    NotificationSettings: undefined;
    PaymentPreferences: undefined;
    Help: undefined;
    DeleteAccount: undefined;
};

// On-Street Stack (accessible from Home)
export type OnStreetStackParamList = {
    OnStreetParking: undefined;
    ZoneSelection: undefined;
    DurationSelection: { zoneId: string };
    OnStreetPayment: { zoneId: string; duration: number };
    OnStreetSession: { sessionId: string };
};

// Main Tab Navigator
export type MainTabParamList = {
    HomeTab: NavigatorScreenParams<HomeStackParamList>;
    SessionTab: NavigatorScreenParams<SessionStackParamList>;
    WalletTab: NavigatorScreenParams<WalletStackParamList>;
    HistoryTab: NavigatorScreenParams<HistoryStackParamList>;
    AccountTab: NavigatorScreenParams<AccountStackParamList>;
};

// Root Navigator
export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
    OnStreet: NavigatorScreenParams<OnStreetStackParamList>;
    Notifications: undefined;
    // Modals
    PaymentModal: { amount: number; sessionId?: string };
    QRScannerModal: { garageId: string; garageName?: string; garageAddress?: string };
    ReceiptModal: { sessionId: string; finalCost: number; durationMinutes: number; receiptUrl?: string; zoneName?: string; address?: string; currency?: string };
};

// For useNavigation hook typing
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
