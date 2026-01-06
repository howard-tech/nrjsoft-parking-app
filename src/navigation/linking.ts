import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ['nrjsoft://', 'https://app.nrjsoft.com'],
    config: {
        screens: {
            Auth: {
                screens: {
                    Login: 'login',
                },
            },
            Main: {
                screens: {
                    HomeTab: {
                        screens: {
                            SmartMap: 'home',
                            GarageDetail: 'garage/:garageId',
                        },
                    },
                    SessionTab: {
                        screens: {
                            ActiveSession: 'session',
                            SessionDetail: 'session/:sessionId',
                        },
                    },
                    WalletTab: {
                        screens: {
                            WalletHome: 'wallet',
                            PaymentCheckout: 'pay/:amount?',
                        },
                    },
                    AccountTab: {
                        screens: {
                            Notifications: 'notifications',
                        },
                    },
                },
            },
            OnStreet: {
                screens: {
                    OnStreetParking: 'onstreet',
                    OnStreetSession: 'onstreet/session/:sessionId',
                },
            },
            Notifications: 'notifications',
            QRScannerModal: 'qr/:garageId',
        },
    },
};
