import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { AppHeader } from '@components/common/AppHeader';
import { Button } from '@components/common/Button';
import { CardField, useStripe } from '@stripe/stripe-react-native';

export const CardPaymentScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { createPaymentMethod } = useStripe();
    const [loading, setLoading] = useState(false);
    const [cardDetailsComplete, setCardDetailsComplete] = useState(false);

    const handleSaveCard = async () => {
        if (!cardDetailsComplete) {
            Alert.alert('Error', 'Please enter complete card details');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Payment Method via Stripe SDK
            const { paymentMethod, error } = await createPaymentMethod({
                paymentMethodType: 'Card',
            });

            if (error) {
                Alert.alert('Error', error.message);
                return;
            }

            if (paymentMethod) {
                // 2. Send paymentMethod.id to backend to attach to customer
                // await paymentService.attachPaymentMethod(paymentMethod.id);
                Alert.alert('Success', 'Card added successfully');
                navigation.goBack();
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to add card');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <AppHeader title="Add Card" showBack />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.cardFormContainer}>
                    <CardField
                        postalCodeEnabled={false}
                        style={styles.cardField}
                        cardStyle={{
                            backgroundColor: theme.colors.neutral.surface,
                            textColor: theme.colors.neutral.textPrimary,
                            placeholderColor: theme.colors.neutral.textSecondary,
                            borderColor: theme.colors.neutral.border,
                            borderWidth: 1,
                            borderRadius: 8,
                        }}
                        onCardChange={(cardDetails) => {
                            setCardDetailsComplete(cardDetails.complete);
                        }}
                    />
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.colors.neutral.surface, borderColor: theme.colors.neutral.border }]}>
                <Button
                    title="Save Card"
                    onPress={handleSaveCard}
                    loading={loading}
                    disabled={!cardDetailsComplete || loading}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    cardFormContainer: {
        marginTop: 20,
        height: 50,
    },
    cardField: {
        width: '100%',
        height: 50,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        paddingBottom: 32,
    },
});
