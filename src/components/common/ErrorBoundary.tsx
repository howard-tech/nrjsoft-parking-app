import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography } from '@theme';
import { crashReportingService } from '@services/analytics';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.warn('Captured error', error, errorInfo);
        crashReportingService.recordError(error, {
            componentStack: errorInfo.componentStack,
        });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <View style={styles.container}>
                    <Icon name="alert-circle-outline" size={64} color={colors.error.main} />
                    <Text style={[styles.title, typography.h3]}>Something went wrong</Text>
                    <Text style={[styles.message, typography.body]}>
                        We hit an unexpected issue. Please try again.
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
                        <Text style={[styles.buttonText, typography.button]}>Try again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: colors.neutral.background,
    },
    title: {
        color: colors.neutral.textPrimary,
        marginTop: 16,
    },
    message: {
        color: colors.neutral.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    button: {
        backgroundColor: colors.primary.main,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    buttonText: {
        color: colors.primary.contrast,
        fontWeight: '700',
    },
});
