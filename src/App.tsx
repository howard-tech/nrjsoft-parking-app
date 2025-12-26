import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { ThemeProvider } from '@theme';
import RNBootSplash from 'react-native-bootsplash';
import './i18n';

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
});

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from './store';
import { RootNavigator } from './navigation/RootNavigator';
import { useAuth } from './hooks/useAuth';

const AppContent = () => {
    const { checkSession } = useAuth();

    useEffect(() => {
        const init = async () => {
            await checkSession();
        };

        init().finally(async () => {
            await RNBootSplash.hide({ fade: true });
            console.log('Bootsplash has been hidden successfully');
        });
    }, [checkSession]);

    return (
        <GestureHandlerRootView style={styles.root}>
            <ThemeProvider>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                <RootNavigator />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
};

const App = (): JSX.Element => (
    <Provider store={store}>
        <AppContent />
    </Provider>
);


export default App;
