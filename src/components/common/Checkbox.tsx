import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@theme';
import Icon from 'react-native-vector-icons/Feather';

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string | React.ReactNode;
    style?: any;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label, style }) => {
    const theme = useTheme();

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={() => onChange(!checked)}
            activeOpacity={0.7}
        >
            <View
                style={[
                    styles.checkbox,
                    {
                        borderColor: checked ? theme.colors.secondary.main : 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: checked ? theme.colors.secondary.main : 'transparent',
                    },
                ]}
            >
                {checked && <Icon name="check" size={14} color="#FFFFFF" />}
            </View>
            {label && (
                <View style={styles.labelContainer}>
                    {typeof label === 'string' ? (
                        <Text style={styles.label}>{label}</Text>
                    ) : (
                        label
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        marginTop: 2,
    },
    labelContainer: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: '#FFFFFF',
        lineHeight: 20,
    },
});
