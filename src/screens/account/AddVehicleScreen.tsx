import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@theme';
import { AppHeader } from '@components/common/AppHeader';
import { accountService } from '@services/account/accountService';
import { AccountStackParamList } from '@navigation/types';
import { RouteProp } from '@react-navigation/native';
import { useToast } from '@components/common/ToastProvider';

export const AddVehicleScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<AccountStackParamList, 'AddVehicle'>>();
    const { showToast } = useToast();
    const [plate, setPlate] = useState('');
    const [model, setModel] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (route.params && 'scannedPlate' in route.params) {
            const scanned = (route.params as { scannedPlate?: string }).scannedPlate;
            if (scanned) {
                setPlate(scanned);
            }
            navigation.setParams({ scannedPlate: undefined } as never);
        }
    }, [navigation, route.params]);

    const handleSave = async () => {
        if (!plate.trim()) {
            Alert.alert('Plate required', 'Please enter a license plate.');
            return;
        }
        setSaving(true);
        try {
            await accountService.addVehicle({
                plate: plate.trim(),
                model: model.trim() || undefined,
                isDefault: false,
            });
            showToast('Vehicle added.', 'success');
            navigation.goBack();
        } catch (err) {
            console.warn('Failed to add vehicle', err);
            Alert.alert('Error', 'Could not save vehicle.');
            showToast('Could not save vehicle.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <AppHeader title="Add Vehicle" showBack />
            <View style={styles.content}>
                <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>License Plate</Text>
                <TextInput
                    style={[
                        styles.input,
                        {
                            borderColor: theme.colors.neutral.border,
                            color: theme.colors.neutral.textPrimary,
                        },
                    ]}
                    placeholder="e.g. ABC-1234"
                    placeholderTextColor={theme.colors.neutral.textSecondary}
                    value={plate}
                    onChangeText={setPlate}
                    autoCapitalize="characters"
                    accessibilityLabel="License plate"
                />
                <TouchableOpacity
                    style={[styles.scanButton, { borderColor: theme.colors.primary.main }]}
                    onPress={() => navigation.navigate('LicensePlateScanner' as never)}
                    accessibilityRole="button"
                    accessibilityLabel="Scan license plate"
                >
                    <Text style={[styles.scanText, { color: theme.colors.primary.main }]}>Scan Plate</Text>
                </TouchableOpacity>

                <Text style={[styles.label, styles.labelSpacing, { color: theme.colors.neutral.textSecondary }]}>Model</Text>
                <TextInput
                    style={[
                        styles.input,
                        {
                            borderColor: theme.colors.neutral.border,
                            color: theme.colors.neutral.textPrimary,
                        },
                    ]}
                    placeholder="e.g. Tesla Model 3"
                    placeholderTextColor={theme.colors.neutral.textSecondary}
                    value={model}
                    onChangeText={setModel}
                    accessibilityLabel="Vehicle model"
                />

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.colors.primary.main }]}
                    onPress={handleSave}
                    accessibilityRole="button"
                    accessibilityLabel="Save vehicle"
                    disabled={saving}
                >
                    <Text style={[styles.saveText, { color: theme.colors.primary.contrast }]}>
                        {saving ? 'Saving...' : 'Save'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16, gap: 4 },
    label: { fontSize: 14, fontWeight: '600' },
    labelSpacing: { marginTop: 12 },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    scanButton: {
        marginTop: 8,
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
    },
    scanText: { fontSize: 14, fontWeight: '700' },
    saveButton: {
        marginTop: 20,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveText: { fontSize: 16, fontWeight: '700' },
});
