import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { ThemeProvider } from '@theme';

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
});

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './navigation';

const App = (): JSX.Element => (
    <GestureHandlerRootView style={styles.root}>
        <ThemeProvider>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <RootNavigator />
        </ThemeProvider>
    </GestureHandlerRootView>
);


export default App;
