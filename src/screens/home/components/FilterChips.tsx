import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@theme';
import { FilterType } from '@hooks/useFilters';

interface FilterChipsProps {
    activeFilter: FilterType | null;
    onChange: (filter: FilterType | null) => void;
}

const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'nearest', label: 'Nearest' },
    { key: 'cheapest', label: 'Cheapest' },
    { key: 'ev_ready', label: 'EV ready' },
    { key: 'max_time', label: 'Max time' },
];

export const FilterChips: React.FC<FilterChipsProps> = ({ activeFilter, onChange }) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(), []);

    const handlePress = (filter: FilterType) => {
        onChange(activeFilter === filter ? null : filter);
    };

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {FILTERS.map(({ key, label }) => {
                const isActive = activeFilter === key;
                return (
                    <TouchableOpacity
                        key={key}
                        style={[
                            styles.chip,
                            {
                                backgroundColor: isActive
                                    ? theme.colors.primary.main
                                    : theme.colors.neutral.surface,
                                borderColor: isActive
                                    ? theme.colors.primary.main
                                    : theme.colors.neutral.border,
                            },
                        ]}
                        onPress={() => handlePress(key)}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                {
                                    color: isActive
                                        ? theme.colors.primary.contrast
                                        : theme.colors.neutral.textPrimary,
                                },
                            ]}
                        >
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const createStyles = () =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 16,
            paddingVertical: 8,
        },
        chip: {
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 18,
            borderWidth: 1,
            marginRight: 8,
        },
        chipText: {
            fontSize: 13,
            fontWeight: '600',
        },
    });
