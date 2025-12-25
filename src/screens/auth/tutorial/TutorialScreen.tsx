import React, { useState, useRef } from 'react';
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
        navigation.navigate('Login');
    };

    const handleCallSupport = () => {
        Linking.openURL(`tel:${SUPPORT_PHONE}`);
    };

    const renderSlide = ({ item }: { item: TutorialSlide }) => (
        <View style={[styles.slide, { width }]}>
            <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
            <View style={styles.slideContent}>
                <Text style={styles.slideTitle}>
                    {t(item.titleKey)}
                </Text>
                <Text style={styles.slideDesc}>
                    {t(item.descriptionKey)}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.primary.main }]}>
            {/* Header with Logo */}
            <View style={styles.header}>
                <Image
                    source={require('../../../assets/images/nrj-logo.png')}
                    style={styles.logo}
                />
                <Text style={styles.brandName}>NRJSOFT MOBILITY</Text>
                <View style={styles.tutorialBadge}>
                    <Text style={styles.tutorialBadgeText}>TUTORIAL</Text>
                </View>
            </View>

            {/* Slide Carousel */}
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

            {/* Pagination Indicators */}
            <View style={styles.indicatorContainer}>
                {tutorialSlides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            index === currentIndex ? styles.activeIndicator : styles.inactiveIndicator,
                            index === currentIndex ? styles.activeIndicatorWidth : styles.inactiveIndicatorWidth,
                        ]}
                    />
                ))}
            </View>

            {/* Navigation Buttons */}
            <View style={styles.navButtons}>
                <TouchableOpacity
                    style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
                    onPress={handlePrev}
                    disabled={currentIndex === 0}
                >
                    <Text style={styles.navButtonText}>{t('tutorial.prev')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.navButton,
                        currentIndex === tutorialSlides.length - 1 && styles.navButtonDisabled,
                    ]}
                    onPress={handleNext}
                    disabled={currentIndex === tutorialSlides.length - 1}
                >
                    <Text style={styles.navButtonText}>{t('tutorial.next')}</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
                <View style={styles.footerRow}>
                    <LanguageSelector />
                    <TouchableOpacity style={styles.helpButton} onPress={handleCallSupport}>
                        <View style={styles.helpIconContainer}>
                            <Icon name="phone" size={16} color={theme.colors.primary.main} />
                        </View>
                        <View>
                            <Text style={styles.helpText}>
                                {t('tutorial.helpHotline')}
                            </Text>
                            <Text style={styles.helpSubtext}>
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
        color: '#FFFFFF',
    },
    tutorialBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tutorialBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    slideImage: {
        width: width * 0.8,
        height: width * 0.8,
        marginBottom: 40,
    },
    slideContent: {
        alignItems: 'center',
    },
    slideTitle: {
        textAlign: 'center',
        marginBottom: 16,
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
    },
    slideDesc: {
        textAlign: 'center',
        lineHeight: 24,
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
    },
    indicator: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeIndicator: {
        backgroundColor: '#FFFFFF',
    },
    inactiveIndicator: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    activeIndicatorWidth: {
        width: 24,
    },
    inactiveIndicatorWidth: {
        width: 8,
    },
    navButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        marginBottom: 40,
    },
    navButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    navButtonDisabled: {
        opacity: 0.3,
    },
    navButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    bottomSection: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    helpButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    helpIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    helpText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    helpSubtext: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    continueButton: {
        width: '100%',
    },
});
