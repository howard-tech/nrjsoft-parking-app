import React from 'react';
import { SafeAreaView, StatusBar, Text, StyleSheet, View } from 'react-native';
import { ThemeProvider, useTheme } from '@theme';

const HomeSplash = (): JSX.Element => {
    const theme = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <StatusBar barStyle="dark-content" />
            <View style={[styles.card, { backgroundColor: theme.colors.neutral.surface }]}>
                <Text style={[styles.title, theme.typography.h2, { color: theme.colors.primary.main }]}>
                    NRJSoft Parking
                </Text>
                <Text style={[styles.subtitle, theme.typography.body, { color: theme.colors.neutral.textSecondary }]}>
                    Design system initialized with NRJ Soft branding.
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        marginBottom: 8,
    },
    subtitle: {
        marginTop: 4,
    },
});

const App = (): JSX.Element => (
    <ThemeProvider>
        <HomeSplash />
    </ThemeProvider>
);

export default App;
