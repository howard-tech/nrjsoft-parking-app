import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { useTheme } from '@theme';

interface OTPInputProps {
    value: string;
    onChangeText: (text: string) => void;
    length?: number;
}

export const OTPInput: React.FC<OTPInputProps> = ({
    value,
    onChangeText,
    length = 4,
}) => {
    const inputs = useRef<TextInput[]>([]);

    const handleChange = (text: string, index: number) => {
        const newValue = value.split('');
        newValue[index] = text;
        const updatedValue = newValue.join('');
        onChangeText(updatedValue);

        if (text && index < length - 1) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    return (
        <View style={styles.container}>
            {Array.from({ length }).map((_, index) => (
                <View key={index} style={styles.inputWrapper}>
                    <TextInput
                        ref={(ref) => {
                            if (ref) inputs.current[index] = ref;
                        }}
                        style={[
                            styles.input,
                            {
                                color: '#FFFFFF',
                                borderColor: value[index] ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)'
                            }
                        ]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={value[index] || ''}
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        textAlign="center"
                        autoFocus={index === 0}
                    />
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapper: {
        marginHorizontal: 8,
    },
    input: {
        width: 60,
        height: 70,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        borderWidth: 1.5,
        fontSize: 28,
        fontWeight: '700',
    },
});
