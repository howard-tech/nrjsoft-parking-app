import React from 'react';
import { SafeAreaView, StatusBar, Text, useColorScheme, StyleSheet } from 'react-native';

const App = (): JSX.Element => {
    const isDarkMode = useColorScheme() === 'dark';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <Text style={styles.text}>NRJSoft Parking App</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default App;
