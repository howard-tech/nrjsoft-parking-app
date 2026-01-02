import React, { useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    TouchableWithoutFeedback,
} from 'react-native';

interface Country {
    code: string;
    flag: string;
    name: string;
}

const COUNTRIES: Country[] = [
    { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
    { code: '+49', flag: '🇩🇪', name: 'Germany' },
    { code: '+43', flag: '🇦🇹', name: 'Austria' },
    { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
    { code: '+40', flag: '🇷🇴', name: 'Romania' },
    { code: '+30', flag: '🇬🇷', name: 'Greece' },
];

interface PhoneInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    countryCode?: string;
    onCountryChange?: (code: string) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
    value,
    onChangeText,
    placeholder = 'Mobile number',
    countryCode = '+49',
    onCountryChange,
}) => {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[1];

    const handleSelect = (code: string) => {
        onCountryChange?.(code);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.countryCodeContainer}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.flag}>{selectedCountry.flag}</Text>
                <Text style={styles.countryCode}>{selectedCountry.code}</Text>
            </TouchableOpacity>

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

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <FlatList
                                data={COUNTRIES}
                                keyExtractor={(item) => item.code}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.countryItem}
                                        onPress={() => handleSelect(item.code)}
                                    >
                                        <Text style={styles.itemFlag}>{item.flag}</Text>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemCode}>{item.code}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
        padding: 0,
        color: '#FFFFFF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#1E3A5F', // Matching primary theme color
        borderRadius: 12,
        maxHeight: 400,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    itemFlag: {
        fontSize: 24,
        marginRight: 12,
    },
    itemName: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
    },
    itemCode: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 16,
        fontWeight: '600',
    },
});
