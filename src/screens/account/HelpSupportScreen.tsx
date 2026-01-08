import React, { useMemo, useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DeviceInfo from 'react-native-device-info';
import { useTheme } from '@theme';
import { AppHeader } from '@components/common/AppHeader';

const FAQ_ITEMS = [
    {
        question: 'How do I start a parking session?',
        answer:
            'Open the Smart Map, select a garage, then tap “Start Session” for ANPR entry or “Scan QR” for QR entry.',
    },
    {
        question: 'What payment methods are accepted?',
        answer: 'We accept cards, Apple Pay, Google Pay, and NRJ Wallet balance.',
    },
    {
        question: 'How do I add a vehicle?',
        answer: 'Go to Account → Vehicles and tap “Add Vehicle”. You can scan your plate or enter it manually.',
    },
    {
        question: 'What happens if I overstay?',
        answer: 'Overstay penalties vary by location. Check the garage details for specific fees.',
    },
    {
        question: 'How do I get a receipt?',
        answer: 'Receipts are generated after each session and available in Account → History.',
    },
];

const SUPPORT_PHONE = '+49 800 223 4455';
const SUPPORT_EMAIL = 'support@nrjsoft.com';

export const HelpSupportScreen: React.FC = () => {
    const theme = useTheme();
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [feedback, setFeedback] = useState('');

    const appVersion = useMemo(() => {
        return `${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`;
    }, []);

    const handleCallSupport = () => {
        Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => {
            Alert.alert('Error', 'Unable to open phone dialer.');
        });
    };

    const handleEmailSupport = () => {
        const subject = encodeURIComponent('NRJSoft Parking Support Request');
        const body = encodeURIComponent(
            `App Version: ${appVersion}\nDevice: ${DeviceInfo.getModel()}\nOS: ${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()}\n\n${feedback || 'Describe your issue here...'}`
        );
        Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`).catch(() => {
            Alert.alert('Error', 'Unable to open email client.');
        });
    };

    const handleOpenLink = (url: string) => {
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Unable to open the link.');
        });
    };

    const toggleFaq = (index: number) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <AppHeader title="Help & Support" showBack />

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.neutral.textSecondary }]}>CONTACT US</Text>

                <TouchableOpacity
                    style={[styles.contactCard, { backgroundColor: theme.colors.neutral.surface }]}
                    onPress={handleCallSupport}
                    accessibilityRole="button"
                    accessibilityLabel="Call support hotline"
                >
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary.light }]}>
                        <Icon name="phone" size={24} color={theme.colors.primary.main} />
                    </View>
                    <View style={styles.contactInfo}>
                        <Text style={[styles.contactTitle, { color: theme.colors.neutral.textPrimary }]}>Call Support</Text>
                        <Text style={[styles.contactSubtitle, { color: theme.colors.neutral.textSecondary }]}>
                            {SUPPORT_PHONE}
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={24} color={theme.colors.neutral.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.contactCard, { backgroundColor: theme.colors.neutral.surface }]}
                    onPress={handleEmailSupport}
                    accessibilityRole="button"
                    accessibilityLabel="Email support"
                >
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary.light }]}>
                        <Icon name="email" size={24} color={theme.colors.primary.main} />
                    </View>
                    <View style={styles.contactInfo}>
                        <Text style={[styles.contactTitle, { color: theme.colors.neutral.textPrimary }]}>Email Support</Text>
                        <Text style={[styles.contactSubtitle, { color: theme.colors.neutral.textSecondary }]}>
                            {SUPPORT_EMAIL}
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={24} color={theme.colors.neutral.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.neutral.textSecondary }]}>FEEDBACK</Text>
                <TextInput
                    style={[
                        styles.feedbackInput,
                        { backgroundColor: theme.colors.neutral.surface, borderColor: theme.colors.neutral.border },
                    ]}
                    value={feedback}
                    onChangeText={setFeedback}
                    placeholder="Tell us what we can improve…"
                    placeholderTextColor={theme.colors.neutral.textSecondary}
                    multiline
                    accessibilityLabel="Feedback input"
                />
                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: theme.colors.primary.main }]}
                    onPress={handleEmailSupport}
                    accessibilityRole="button"
                    accessibilityLabel="Send feedback"
                >
                    <Text style={styles.primaryButtonText}>Send Feedback</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.neutral.textSecondary }]}>FAQ</Text>
                {FAQ_ITEMS.map((item, index) => (
                    <TouchableOpacity
                        key={item.question}
                        style={[styles.faqItem, { backgroundColor: theme.colors.neutral.surface }]}
                        onPress={() => toggleFaq(index)}
                        accessibilityRole="button"
                        accessibilityLabel={item.question}
                    >
                        <View style={styles.faqHeader}>
                            <Text style={[styles.faqQuestion, { color: theme.colors.neutral.textPrimary }]}>
                                {item.question}
                            </Text>
                            <Icon
                                name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                                size={22}
                                color={theme.colors.neutral.textSecondary}
                            />
                        </View>
                        {expandedFaq === index && (
                            <Text style={[styles.faqAnswer, { color: theme.colors.neutral.textSecondary }]}>
                                {item.answer}
                            </Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.neutral.textSecondary }]}>LEGAL</Text>
                <TouchableOpacity
                    style={[styles.linkItem, { backgroundColor: theme.colors.neutral.surface }]}
                    onPress={() => handleOpenLink('https://nrjsoft.com/privacy')}
                    accessibilityRole="link"
                    accessibilityLabel="Privacy Policy"
                >
                    <Text style={[styles.linkText, { color: theme.colors.neutral.textPrimary }]}>Privacy Policy</Text>
                    <Icon name="open-in-new" size={20} color={theme.colors.neutral.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.linkItem, { backgroundColor: theme.colors.neutral.surface }]}
                    onPress={() => handleOpenLink('https://nrjsoft.com/terms')}
                    accessibilityRole="link"
                    accessibilityLabel="Terms of Service"
                >
                    <Text style={[styles.linkText, { color: theme.colors.neutral.textPrimary }]}>Terms of Service</Text>
                    <Icon name="open-in-new" size={20} color={theme.colors.neutral.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.appInfo}>
                <Text style={[styles.appVersion, { color: theme.colors.neutral.textSecondary }]}>
                    NRJSoft Parking v{appVersion}
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    section: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
    sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactInfo: { flex: 1, marginLeft: 12 },
    contactTitle: { fontSize: 15, fontWeight: '700' },
    contactSubtitle: { fontSize: 12, marginTop: 2 },
    feedbackInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    primaryButton: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    primaryButtonText: { color: '#FFF', fontWeight: '700' },
    faqItem: { padding: 12, borderRadius: 12 },
    faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    faqQuestion: { fontSize: 14, fontWeight: '700', flex: 1, paddingRight: 8 },
    faqAnswer: { marginTop: 8, fontSize: 13 },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
    },
    linkText: { fontSize: 14, fontWeight: '600' },
    appInfo: { padding: 16, alignItems: 'center' },
    appVersion: { fontSize: 12 },
});

export default HelpSupportScreen;
