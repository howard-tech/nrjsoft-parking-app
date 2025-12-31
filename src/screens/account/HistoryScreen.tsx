import React from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@theme';
import { useSessionHistory } from '@hooks';
import { formatCurrency } from '@utils/formatters';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { ParkingSession } from '@services/session/types';

export const HistoryScreen: React.FC = () => {
    const { history, isLoading, loadMore, hasMore } = useSessionHistory();
    const theme = useTheme();
    const navigation = useNavigation();

    const renderItem = ({ item }: { item: ParkingSession }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.neutral.surface }]}
            onPress={() =>
                navigation.navigate('HistoryTab' as never, {
                    screen: 'HistoryDetail',
                    params: { sessionId: item.id },
                } as never)
            }
        >
            <View style={styles.row}>
                <Text style={[styles.zone, { color: theme.colors.neutral.textPrimary }]}>
                    {item.zoneName || item.garageName || 'Parking session'}
                </Text>
                <Text style={[styles.amount, { color: theme.colors.neutral.textPrimary }]}>
                    {item.currency ?? 'EUR'} {formatCurrency(item.currentCost ?? 0, item.currency ?? 'EUR')}
                </Text>
            </View>
            <Text style={[styles.sub, { color: theme.colors.neutral.textSecondary }]}>
                {new Date(item.startTime).toLocaleString()}
            </Text>
            <View style={styles.receiptRow}>
                <Icon name="file-pdf-box" size={18} color={theme.colors.primary.main} />
                <Text style={[styles.receiptText, { color: theme.colors.primary.main }]}>View receipt</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            onEndReached={() => hasMore && loadMore()}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
                !isLoading ? (
                    <View style={styles.empty}>
                        <Icon name="history" size={48} color={theme.colors.neutral.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.colors.neutral.textSecondary }]}>
                            No past sessions yet.
                        </Text>
                    </View>
                ) : null
            }
        />
    );
};

const styles = StyleSheet.create({
    list: {
        padding: 16,
        gap: 12,
    },
    card: {
        padding: 14,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    zone: {
        fontSize: 15,
        fontWeight: '700',
    },
    amount: {
        fontSize: 15,
        fontWeight: '700',
    },
    sub: {
        marginTop: 4,
        fontSize: 12,
    },
    receiptRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        columnGap: 6,
    },
    receiptText: {
        fontSize: 12,
        fontWeight: '700',
    },
    empty: {
        alignItems: 'center',
        marginTop: 40,
        gap: 8,
    },
    emptyText: {
        fontSize: 14,
    },
});
