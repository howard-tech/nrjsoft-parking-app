import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@theme';
import { AppHeader } from '@components/common/AppHeader';

export const AddVehicleScreen: React.FC = () => {
    const theme = useTheme();
    const [plate, setPlate] = useState('');
    const [model, setModel] = useState('');

    const handleSave = () => {
        if (!plate.trim()) {
            Alert.alert('Plate required', 'Please enter a license plate.');
            return;
        }
        Alert.alert('Saved', 'Vehicle saved locally (stub).');
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
                />

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
                />

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.colors.primary.main }]}
                    onPress={handleSave}
                    accessibilityRole="button"
                    accessibilityLabel="Save vehicle"
                >
                    <Text style={[styles.saveText, { color: theme.colors.primary.contrast }]}>Save</Text>
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
    saveButton: {
        marginTop: 20,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveText: { fontSize: 16, fontWeight: '700' },
});
