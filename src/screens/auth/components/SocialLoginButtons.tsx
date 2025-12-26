import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';

export const SocialLoginButtons: React.FC = () => {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} activeOpacity={0.8}>
                <Icon name="google" size={20} color="#EA4335" style={styles.icon} />
                <Text style={styles.buttonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} activeOpacity={0.8}>
                <Icon name="apple" size={20} color="#000000" style={styles.icon} />
                <Text style={styles.buttonText}>Apple</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        height: 52,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    icon: {
        marginRight: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
    },
});
