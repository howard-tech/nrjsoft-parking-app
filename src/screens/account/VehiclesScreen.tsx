import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { accountService, Vehicle } from '@services/account/accountService';

export const VehiclesScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(false);

    const loadVehicles = async () => {
        setLoading(true);
        try {
            const data = await accountService.getVehicles();
            setVehicles(data);
        } catch (err) {
            console.warn('Failed to load vehicles', err);
            Alert.alert('Error', 'Unable to load vehicles right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadVehicles);
        return unsubscribe;
    }, [navigation]);

    const handleSetDefault = async (vehicleId: string) => {
        try {
            const updated = await accountService.setDefaultVehicle(vehicleId);
            setVehicles((prev) => prev.map((v) => ({ ...v, isDefault: v.id === updated.id })));
        } catch (err) {
            console.warn('Failed to set default vehicle', err);
            Alert.alert('Error', 'Could not set default vehicle.');
        }
    };

    const handleDelete = async (vehicleId: string) => {
        Alert.alert('Delete vehicle', 'Are you sure you want to delete this vehicle?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await accountService.deleteVehicle(vehicleId);
                        setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
                    } catch (err) {
                        console.warn('Failed to delete vehicle', err);
                        Alert.alert('Error', 'Could not delete vehicle.');
                    }
                },
            },
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.neutral.textPrimary }]}>Vehicles</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.primary.main }]}
                    onPress={() => navigation.navigate('AddVehicle' as never)}
                    accessibilityRole="button"
                    accessibilityLabel="Add vehicle"
                >
                    <Icon name="plus" size={18} color={theme.colors.primary.contrast} />
                    <Text style={[styles.addText, { color: theme.colors.primary.contrast }]}>Add</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={vehicles}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshing={loading}
                onRefresh={loadVehicles}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: theme.colors.neutral.surface,
                                borderColor: theme.colors.neutral.border,
                                shadowColor: theme.colors.shadow?.default ?? '#000',
                            },
                        ]}
                    >
                        <Text style={[styles.plate, { color: theme.colors.neutral.textPrimary }]}>
                            {item.plate}
                        </Text>
                        {item.model ? (
                            <Text style={[styles.model, { color: theme.colors.neutral.textSecondary }]}>
                                {item.model}
                            </Text>
                        ) : null}
                        {item.isDefault && (
                            <Text style={[styles.badge, { color: theme.colors.success.main }]}>Default</Text>
                        )}
                        <View style={styles.row}>
                            {!item.isDefault ? (
                                <TouchableOpacity
                                    onPress={() => handleSetDefault(item.id)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Set default vehicle"
                                >
                                    <Text style={[styles.action, { color: theme.colors.primary.main }]}>Set default</Text>
                                </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity
                                onPress={() => handleDelete(item.id)}
                                accessibilityRole="button"
                                accessibilityLabel="Delete vehicle"
                            >
                                <Text style={[styles.action, { color: theme.colors.error.main }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator color={theme.colors.primary.main} />
                    ) : (
                        <View style={styles.empty}>
                            <Icon name="car-outline" size={48} color={theme.colors.neutral.textSecondary} />
                            <Text style={[styles.emptyText, { color: theme.colors.neutral.textSecondary }]}>
                                No vehicles yet. Add your car to speed up checkout.
                            </Text>
                        </View>
                    )
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    title: { fontSize: 22, fontWeight: '700' },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
    },
    addText: { fontSize: 14, fontWeight: '600' },
    list: { gap: 10 },
    card: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    plate: { fontSize: 16, fontWeight: '700' },
    model: { fontSize: 13, marginTop: 2 },
    badge: { marginTop: 6, fontSize: 12, fontWeight: '700' },
    empty: { alignItems: 'center', marginTop: 32, gap: 8 },
    emptyText: { fontSize: 14, textAlign: 'center' },
    row: { flexDirection: 'row', justifyContent: 'flex-start', marginTop: 8, gap: 16 },
    action: { fontSize: 13, fontWeight: '700' },
});
