import React, { useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    Image,
    TouchableOpacity,
    Linking,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme';
import Icon from 'react-native-vector-icons/Feather';
import { tutorialSlides, TutorialSlide } from './tutorialData';
import { LanguageSelector } from '../../../components/common/LanguageSelector';
import { Button } from '../../../components/common/Button';
import { setOnboardingComplete } from '../../../services/storage';
import { AuthStackParamList } from '../../../navigation/types';

const { width } = Dimensions.get('window');
const SUPPORT_PHONE = '+49 800 223 4455';

export const TutorialScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const { t } = useTranslation();
    const theme = useTheme();
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const themedStyles = useMemo(
        () =>
            StyleSheet.create({
                slideDescColor: { color: 'rgba(255, 255, 255, 0.8)' },
                badgeBg: { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
                indicatorActive: { backgroundColor: theme.colors.neutral.white, width: 18 },
                indicatorInactive: { backgroundColor: 'rgba(255, 255, 255, 0.3)', width: 6 },
                navBorder: { borderColor: 'rgba(255, 255, 255, 0.3)' },
                helpSubtextMuted: { color: 'rgba(255, 255, 255, 0.6)' },
            }),
        [theme.colors.neutral.white]
    );

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollOffset / width);
        setCurrentIndex(index);
    };

    const goToSlide = (index: number) => {
        if (index >= 0 && index < tutorialSlides.length) {
            flatListRef.current?.scrollToIndex({ index, animated: true });
            setCurrentIndex(index);
        }
    };

    const handleNext = () => {
        if (currentIndex < tutorialSlides.length - 1) {
            goToSlide(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            goToSlide(currentIndex - 1);
        }
    };

    const handleContinue = async () => {
        await setOnboardingComplete(true);
        navigation.replace('Login');
    };

    const handleSkip = async () => {
        await setOnboardingComplete(true);
        navigation.replace('Login');
    };

    const handleCallSupport = () => {
        Linking.openURL(`tel:${SUPPORT_PHONE}`);
    };

    const renderSlide = ({ item }: { item: TutorialSlide }) => (
        <View style={[styles.slide, { width }]}>
            <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
            <View style={styles.slideContent}>
                <Text style={[styles.slideTitle, { color: theme.colors.neutral.white }]}>
                    {t(item.titleKey)}
                </Text>
                <Text style={[styles.slideDesc, themedStyles.slideDescColor]}>
                    {t(item.descriptionKey)}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.primary.main }]}>
            <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                accessibilityRole="button"
                accessibilityLabel={t('tutorial.skip')}
            >
                <Text style={[styles.skipText, { color: theme.colors.neutral.white }]}>{t('tutorial.skip')}</Text>
            </TouchableOpacity>
            {/* Header with Logo */}
            <View style={styles.header}>
                <Image
                    source={require('../../../assets/images/nrj-logo.png')}
                    style={styles.logo}
                />
                <Text style={[styles.brandName, { color: theme.colors.neutral.white }]}>NRJSOFT MOBILITY</Text>
                <View style={[styles.tutorialBadge, themedStyles.badgeBg]}>
                    <Text style={[styles.tutorialBadgeText, { color: theme.colors.neutral.white }]}>TUTORIAL</Text>
                </View>
            </View>

            {/* Slide Carousel */}
            <View style={styles.carouselContainer}>
                <FlatList
                    ref={flatListRef}
                    data={tutorialSlides}
                    renderItem={renderSlide}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    keyExtractor={(item) => item.id}
                    getItemLayout={(_, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                />
            </View>

            {/* Pagination Indicators */}
            <View
                style={styles.indicatorContainer}
                accessibilityElementsHidden={true}
                importantForAccessibility="no-hide-descendants"
            >
                {tutorialSlides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            index === currentIndex ? themedStyles.indicatorActive : themedStyles.indicatorInactive,
                        ]}
                    />
                ))}
            </View>

            {/* Navigation Buttons */}
            <View style={styles.navButtons}>
                <TouchableOpacity
                    style={[styles.navButton, themedStyles.navBorder, currentIndex === 0 && styles.navButtonDisabled]}
                    onPress={handlePrev}
                    disabled={currentIndex === 0}
                    accessibilityLabel={t('tutorial.prev')}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: currentIndex === 0 }}
                >
                    <Text style={[styles.navButtonText, { color: theme.colors.neutral.white }]}>{t('tutorial.prev')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.navButton,
                        themedStyles.navBorder,
                        currentIndex === tutorialSlides.length - 1 && styles.navButtonDisabled,
                    ]}
                    onPress={handleNext}
                    disabled={currentIndex === tutorialSlides.length - 1}
                    accessibilityLabel={t('tutorial.next')}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: currentIndex === tutorialSlides.length - 1 }}
                >
                    <Text style={[styles.navButtonText, { color: theme.colors.neutral.white }]}>{t('tutorial.next')}</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
                <View style={styles.footerRow}>
                    <LanguageSelector />
                    <TouchableOpacity
                        style={styles.helpButton}
                        onPress={handleCallSupport}
                        accessibilityLabel={t('tutorial.helpHotline')}
                        accessibilityRole="button"
                        accessibilityHint={SUPPORT_PHONE}
                    >
                        <View style={[styles.helpIconContainer, { backgroundColor: theme.colors.neutral.white }]}>
                            <Icon name="phone" size={16} color={theme.colors.primary.main} />
                        </View>
                        <View>
                            <Text style={[styles.helpText, { color: theme.colors.neutral.white }]}>
                                {t('tutorial.helpHotline')}
                            </Text>
                            <Text style={[styles.helpSubtext, themedStyles.helpSubtextMuted]}>
                                {SUPPORT_PHONE}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Button
                    title={t('tutorial.continueToSignIn')}
                    onPress={handleContinue}
                    variant="secondary"
                    style={styles.continueButton}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    skipButton: {
        position: 'absolute',
        top: 40,
        right: 24,
        paddingVertical: 6,
        paddingHorizontal: 10,
        zIndex: 1,
    },
    skipText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
    },
    logo: {
        width: 64,
        height: 64,
        marginBottom: 8,
    },
    brandName: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 12,
    },
    tutorialBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tutorialBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    carouselContainer: {
        height: width * 1.0,
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 40,
        paddingTop: 0,
    },
    slideImage: {
        width: width * 0.7,
        height: width * 0.7,
        marginBottom: 24,
    },
    slideContent: {
        alignItems: 'center',
    },
    slideTitle: {
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 24,
        fontWeight: '700',
    },
    slideDesc: {
        textAlign: 'center',
        lineHeight: 20,
        fontSize: 14,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
        marginTop: -10,
    },
    indicator: {
        height: 6,
        borderRadius: 3,
        marginHorizontal: 3,
    },
    navButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        marginBottom: 24,
    },
    navButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    navButtonDisabled: {
        opacity: 0.3,
    },
    navButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    bottomSection: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    helpButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    helpIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    helpText: {
        fontSize: 13,
        fontWeight: '700',
    },
    helpSubtext: {
        fontSize: 11,
    },
    continueButton: {
        width: '100%',
    },
});
