import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useLocalization } from '@hooks/useLocalization';
import { SupportedLanguage } from '../../i18n/types';

const LANGUAGES: Array<{ code: SupportedLanguage; label: string }> = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'bg', label: 'Български' },
    { code: 'vi', label: 'Tiếng Việt' },
];

export const LanguageSelector: React.FC = () => {
    const { language, updateLanguage } = useLocalization();

    const currentIndex = Math.max(LANGUAGES.findIndex((item) => item.code === language), 0);
    const currentLanguage = LANGUAGES[currentIndex];

    const handleNextLanguage = async () => {
        const nextIndex = (currentIndex + 1) % LANGUAGES.length;
        await updateLanguage(LANGUAGES[nextIndex].code);
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handleNextLanguage} accessibilityRole="button">
            <Icon name="globe" size={16} color="#FFFFFF" />
            <Text style={styles.text}>
                {currentLanguage.label}
            </Text>
            <Icon name="chevron-right" size={16} color="#FFFFFF" />
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
