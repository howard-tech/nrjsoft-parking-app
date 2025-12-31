import React, { useMemo, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '@theme';
import { SearchResult } from '@hooks/useSearch';

interface SearchBarProps {
    query: string;
    onQueryChange: (value: string) => void;
    results: SearchResult[];
    recentSearches: SearchResult[];
    loading?: boolean;
    onSelect: (result: SearchResult) => void;
    onSubmit: (value: string) => void;
    onClearRecent?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    query,
    onQueryChange,
    results,
    recentSearches,
    loading = false,
    onSelect,
    onSubmit,
    onClearRecent,
}) => {
    const theme = useTheme();
    const [isFocused, setFocused] = useState(false);
    const styles = useMemo(() => createStyles(theme), [theme]);

    const handleSelect = (item: SearchResult) => {
        onSelect(item);
        onQueryChange(item.name);
        setFocused(false);
    };

    const showDropdown = isFocused && (query.length > 0 || recentSearches.length > 0);

    const renderResultItem = ({ item }: { item: SearchResult }) => (
        <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
            <Icon name="map-pin" size={16} color={theme.colors.neutral.textSecondary} />
            <View style={styles.resultContent}>
                <Text style={styles.resultTitle}>{item.name}</Text>
                {item.addressLabel ? (
                    <Text style={styles.resultSubtitle}>{item.addressLabel}</Text>
                ) : null}
            </View>
            {item.distanceMeters !== undefined && (
                <Text style={styles.resultDistance}>{Math.round(item.distanceMeters)}m</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.inputContainer,
                    {
                        borderColor: isFocused ? theme.colors.primary.main : theme.colors.neutral.border,
                    },
                ]}
            >
                <Icon name="search" size={18} color={theme.colors.neutral.textSecondary} />
                <TextInput
                    style={styles.input}
                    placeholder="Search garages, streets..."
                    placeholderTextColor={theme.colors.neutral.textSecondary}
                    value={query}
                    onChangeText={onQueryChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 200)}
                    returnKeyType="search"
                    onSubmitEditing={() => onSubmit(query)}
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => onQueryChange('')}>
                        <Icon name="x" size={18} color={theme.colors.neutral.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {showDropdown && (
                <View style={styles.dropdown}>
                    {query.length === 0 && recentSearches.length > 0 && (
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent</Text>
                            {onClearRecent ? (
                                <TouchableOpacity onPress={onClearRecent}>
                                    <Text style={styles.clearText}>Clear</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    )}
                    {query.length === 0 && recentSearches.length > 0 ? (
                        recentSearches.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.resultItem}
                                onPress={() => handleSelect(item)}
                            >
                                <Icon name="clock" size={16} color={theme.colors.neutral.textSecondary} />
                                <Text style={styles.resultTitle}>{item.name}</Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <FlatList
                            data={results}
                            keyExtractor={(item) => item.id}
                            renderItem={renderResultItem}
                            keyboardShouldPersistTaps="handled"
                            ListEmptyComponent={
                                !loading && query.length > 2 ? (
                                    <Text style={styles.emptyText}>No results</Text>
                                ) : null
                            }
                            style={styles.list}
                        />
                    )}
                </View>
            )}
        </View>
    );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            zIndex: 5,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1,
            backgroundColor: theme.colors.neutral.surface,
        },
        input: {
            flex: 1,
            marginHorizontal: 10,
            fontSize: 15,
            color: theme.colors.neutral.textPrimary,
        },
        dropdown: {
            position: 'absolute',
            top: 54,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.neutral.surface,
            borderRadius: 12,
            shadowColor: '#000000',
            shadowOpacity: 0.15,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            maxHeight: 260,
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 8,
            paddingVertical: 6,
        },
        sectionTitle: {
            fontSize: 12,
            color: theme.colors.neutral.textSecondary,
            fontWeight: '600',
        },
        clearText: {
            fontSize: 12,
            color: theme.colors.primary.main,
            fontWeight: '700',
        },
        resultItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 10,
            borderRadius: 10,
        },
        resultContent: {
            flex: 1,
            marginLeft: 10,
        },
        resultTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.neutral.textPrimary,
        },
        resultSubtitle: {
            fontSize: 12,
            color: theme.colors.neutral.textSecondary,
        },
        resultDistance: {
            fontSize: 12,
            color: theme.colors.neutral.textSecondary,
        },
        emptyText: {
            textAlign: 'center',
            paddingVertical: 16,
            color: theme.colors.neutral.textSecondary,
        },
        list: {
            maxHeight: 220,
        },
    });
