import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';

interface PhoneInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
    value,
    onChangeText,
    placeholder = 'Mobile number',
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.countryCodeContainer}>
                {/* Fixed to German flag/code for now as per technical proposal mentions */}
                <Text style={styles.flag}>🇩🇪</Text>
                <Text style={styles.countryCode}>+49</Text>
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChangeText}
                    maxLength={15}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 56,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
    },
    countryCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRightWidth: 1,
        borderRightColor: 'rgba(255, 255, 255, 0.2)',
    },
    flag: {
        fontSize: 20,
        marginRight: 8,
    },
    countryCode: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    inputContainer: {
        flex: 1,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    input: {
        fontSize: 16,
        fontWeight: '500',
        padding: 0, // Reset default padding on Android
        color: '#FFFFFF',
    },
});
