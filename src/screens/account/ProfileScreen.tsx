import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@theme';
import { AppHeader } from '@components/common/AppHeader';
import { accountService, UserProfile } from '@services/account/accountService';

export const ProfileScreen: React.FC = () => {
    const theme = useTheme();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await accountService.getProfile();
                setProfile(data);
            } catch (err) {
                console.warn('Failed to load profile', err);
                Alert.alert('Error', 'Unable to load profile.');
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            const updated = await accountService.updateProfile({ name: profile.name, email: profile.email });
            setProfile(updated);
            Alert.alert('Saved', 'Profile updated.');
        } catch (err) {
            console.warn('Failed to update profile', err);
            Alert.alert('Error', 'Could not update profile.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <AppHeader title="Profile" showBack />
            <View style={styles.content}>
                <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>Name</Text>
                <TextInput
                    style={[
                        styles.input,
                        { borderColor: theme.colors.neutral.border, color: theme.colors.neutral.textPrimary },
                    ]}
                    value={profile?.name ?? ''}
                    onChangeText={(text) => setProfile((prev) => (prev ? { ...prev, name: text } : prev))}
                    placeholder="Your name"
                    placeholderTextColor={theme.colors.neutral.textSecondary}
                />

                <Text style={[styles.label, styles.spacing, { color: theme.colors.neutral.textSecondary }]}>Email</Text>
                <TextInput
                    style={[
                        styles.input,
                        { borderColor: theme.colors.neutral.border, color: theme.colors.neutral.textPrimary },
                    ]}
                    value={profile?.email ?? ''}
                    onChangeText={(text) => setProfile((prev) => (prev ? { ...prev, email: text } : prev))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="you@example.com"
                    placeholderTextColor={theme.colors.neutral.textSecondary}
                />

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.colors.primary.main }]}
                    onPress={handleSave}
                    disabled={saving}
                    accessibilityLabel="Save profile"
                    accessibilityRole="button"
                >
                    <Text style={[styles.saveText, { color: theme.colors.primary.contrast }]}>
                        {saving ? 'Saving...' : 'Save'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16 },
    label: { fontSize: 14, fontWeight: '600' },
    spacing: { marginTop: 12 },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginTop: 6,
    },
    saveButton: {
        marginTop: 20,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveText: { fontSize: 16, fontWeight: '700' },
});

export default ProfileScreen;
