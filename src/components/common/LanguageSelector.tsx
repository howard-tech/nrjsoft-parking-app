import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Feather';

export const LanguageSelector: React.FC = () => {
    const { i18n } = useTranslation();

    const currentLanguage = i18n.language || 'en';

    const toggleLanguage = () => {
        const nextLang = currentLanguage === 'en' ? 'de' : 'en';
        i18n.changeLanguage(nextLang);
    };

    return (
        <TouchableOpacity style={styles.container} onPress={toggleLanguage}>
            <Icon name="globe" size={16} color="#FFFFFF" />
            <Text style={styles.text}>
                {currentLanguage.toUpperCase()}
            </Text>
            <Icon name="chevron-down" size={16} color="#FFFFFF" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignSelf: 'flex-start',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginHorizontal: 8,
    },
});
