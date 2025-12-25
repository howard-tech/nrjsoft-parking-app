import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';

export const setOnboardingComplete = async (complete: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, JSON.stringify(complete));
    } catch (error) {
        console.error('Error saving onboarding status:', error);
    }
};

export const isOnboardingComplete = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        return value ? JSON.parse(value) : false;
    } catch (error) {
        console.error('Error reading onboarding status:', error);
        return false;
    }
};
