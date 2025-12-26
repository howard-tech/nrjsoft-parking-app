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
import { RootNavigator } from './navigation';

const App = (): JSX.Element => {
    useEffect(() => {
        const init = async () => {
            // …do multiple sync or async tasks
        };

        init().finally(async () => {
            await RNBootSplash.hide({ fade: true });
            console.log('Bootsplash has been hidden successfully');
        });
    }, []);

    return (
        <GestureHandlerRootView style={styles.root}>
            <ThemeProvider>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                <RootNavigator />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
};


export default App;
