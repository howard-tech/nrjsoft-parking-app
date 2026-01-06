import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme } from '@theme';
import Icon from 'react-native-vector-icons/Feather';
import { inboxService, NotificationItem } from '@services/notifications/inboxService';
import { AppHeader } from '@components/common/AppHeader';

export const NotificationsScreen: React.FC = () => {
    const theme = useTheme();
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const load = async (reset = false) => {
        if (loading) return;
        setLoading(true);
        const nextPage = reset ? 1 : page;
        try {
            const { items: data, hasMore: more } = await inboxService.list(nextPage);
            setItems(reset ? data : [...items, ...data]);
            setHasMore(more);
            setPage(reset ? 2 : nextPage + 1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const markRead = async (id: string) => {
        setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        try {
            await inboxService.markRead(id);
        } catch (err) {
            console.warn('Failed to mark read', err);
        }
    };

    const renderItem = ({ item }: { item: NotificationItem }) => (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: theme.colors.neutral.surface,
                    borderColor: theme.colors.neutral.border,
                    opacity: item.read ? 0.7 : 1,
                },
            ]}
            onPress={() => markRead(item.id)}
        >
            <View style={styles.row}>
                <Text style={[styles.title, { color: theme.colors.neutral.textPrimary }]}>{item.title}</Text>
                {!item.read && <Icon name="circle" size={10} color={theme.colors.primary.main} />}
            </View>
            <Text style={[styles.body, { color: theme.colors.neutral.textSecondary }]}>{item.body}</Text>
            <Text style={[styles.meta, { color: theme.colors.neutral.textSecondary }]}>
                {new Date(item.createdAt).toLocaleString()}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <AppHeader title="Notifications" showBack />
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                onEndReached={() => hasMore && load()}
                onEndReachedThreshold={0.5}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={() => load(true)} />}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.empty}>
                            <Icon name="bell-off" size={48} color={theme.colors.neutral.textSecondary} />
                            <Text style={[styles.emptyText, { color: theme.colors.neutral.textSecondary }]}>
                                No notifications yet.
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 16, gap: 10 },
    card: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 15, fontWeight: '700' },
    body: { fontSize: 13, marginTop: 4 },
    meta: { fontSize: 12, marginTop: 4 },
    empty: { alignItems: 'center', marginTop: 40, gap: 8 },
    emptyText: { fontSize: 14 },
});

export default NotificationsScreen;
