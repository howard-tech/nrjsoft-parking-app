import { sessionService } from '@services/session/sessionService';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '@navigation/types';

export const createWebhookHandler = (
    navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList>>
) => ({
    handleMessage: (type: string, payload: unknown) => {
        switch (type) {
            case 'SESSION_START':
                sessionService.handleSessionStart(payload as Record<string, unknown>);
                navigationRef.current?.navigate('Main', {
                    screen: 'SessionTab',
                    params: { screen: 'ActiveSession' },
                });
                break;
            case 'SESSION_END': {
                const receipt = sessionService.handleSessionEnd(payload as Record<string, unknown>);
                navigationRef.current?.navigate('Main', {
                    screen: 'HistoryTab',
                    params: { screen: 'HistoryDetail', params: { sessionId: receipt.sessionId } },
                });
                break;
            }
            case 'SESSION_UPDATE':
                sessionService.handleSessionUpdate(payload as Record<string, unknown>);
                break;
            default:
                console.log('Unknown webhook type', type);
        }
    },
});
