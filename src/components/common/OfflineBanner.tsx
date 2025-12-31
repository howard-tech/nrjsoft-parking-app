import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@theme';
import { useNetworkState } from '@hooks/useNetworkState';

export const OfflineBanner: React.FC = () => {
    const theme = useTheme();
    const { isConnected, isInternetReachable } = useNetworkState();
    const translateY = useRef(new Animated.Value(-60)).current;
    const styles = useMemo(() => createStyles(theme), [theme]);

    const isOffline = !isConnected || isInternetReachable === false;

    useEffect(() => {
        Animated.timing(translateY, {
            toValue: isOffline ? 0 : -60,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [isOffline, translateY]);

    if (!isOffline) {
        return null;
    }

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
            <View style={styles.content}>
                <Icon name="wifi-off" size={16} color="#FFFFFF" />
                <Text style={styles.text}>No internet connection</Text>
            </View>
        </Animated.View>
    );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            paddingTop: 44,
            paddingBottom: 10,
            backgroundColor: theme.colors.error.main,
            zIndex: 1000,
            shadowColor: '#000000',
            shadowOpacity: 0.12,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 6,
        },
        content: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
        },
        text: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '600',
            marginLeft: 8,
        },
    });
