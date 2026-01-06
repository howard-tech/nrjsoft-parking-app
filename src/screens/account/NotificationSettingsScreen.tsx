import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { useTheme } from '@theme';
import { AppHeader } from '@components/common/AppHeader';
import { accountService, NotificationPreferences } from '@services/account/accountService';

export const NotificationSettingsScreen: React.FC = () => {
    const theme = useTheme();
    const [prefs, setPrefs] = useState<NotificationPreferences>({ push: true, email: false, sms: false });
    const [loading, setLoading] = useState(false);

    const loadPrefs = async () => {
        setLoading(true);
        try {
            const data = await accountService.getNotificationPreferences();
            setPrefs(data);
        } catch (err) {
            console.warn('Failed to load notification preferences', err);
            Alert.alert('Error', 'Unable to load notification settings right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPrefs();
    }, []);

    const updatePref = async (key: keyof NotificationPreferences, value: boolean) => {
        const next = { ...prefs, [key]: value };
        setPrefs(next);
        try {
            await accountService.updateNotificationPreferences(next);
        } catch (err) {
            console.warn('Failed to update notification preferences', err);
            Alert.alert('Error', 'Could not save preference. Reverting.');
            setPrefs(prefs);
        }
    };

    const renderRow = (label: string, key: keyof NotificationPreferences) => (
        <View style={[styles.row, { borderColor: theme.colors.neutral.border }]}>
            <Text style={[styles.label, { color: theme.colors.neutral.textPrimary }]}>{label}</Text>
            <Switch
                value={prefs[key]}
                onValueChange={(val) => updatePref(key, val)}
                trackColor={{ true: theme.colors.primary.light, false: theme.colors.neutral.border }}
                thumbColor={prefs[key] ? theme.colors.primary.main : theme.colors.neutral.surface}
                accessibilityLabel={`${label} toggle`}
            />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <AppHeader title="Notifications" showBack />
            <View style={styles.content}>
                <Text style={[styles.description, { color: theme.colors.neutral.textSecondary }]}>
                    Control how we notify you about sessions, payments, and account updates.
                </Text>
                {loading ? (
                    <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>Loading…</Text>
                ) : (
                    <>
                        {renderRow('Push notifications', 'push')}
                        {renderRow('Email alerts', 'email')}
                        {renderRow('SMS alerts', 'sms')}
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16, gap: 12 },
    description: { fontSize: 14, marginBottom: 4 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    label: { fontSize: 15, fontWeight: '600' },
});

export default NotificationSettingsScreen;
