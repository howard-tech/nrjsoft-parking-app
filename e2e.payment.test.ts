import { device, element, by, expect, waitFor } from 'detox';

const loginWithOtp = async () => {
    try {
        await element(by.text('Continue to Sign In')).tap();
    } catch (error) {
        // Already on login screen.
    }

    await waitFor(element(by.text('Secure Sign In')))
        .toBeVisible()
        .withTimeout(8000);

    await element(by.label('Mobile number')).tap();
    await element(by.label('Mobile number')).replaceText('+359888123456');
    await element(by.label('I accept the')).tap();
    await element(by.text('Secure login')).tap();

    try {
        await element(by.text('OK')).tap();
    } catch (error) {
        // Alert may not show on all builds.
    }

    await waitFor(element(by.text('Verify Account')))
        .toBeVisible()
        .withTimeout(10000);

    await element(by.id('otp-input-0')).typeText('1');
    await element(by.id('otp-input-1')).typeText('2');
    await element(by.id('otp-input-2')).typeText('3');
    await element(by.id('otp-input-3')).typeText('4');
    await element(by.id('otp-input-4')).typeText('5');
    await element(by.id('otp-input-5')).typeText('6');

    await element(by.text('Verify and Login')).tap();

    await waitFor(element(by.text('Nearest')))
        .toBeVisible()
        .withTimeout(15000);
};

describe('Payment Flow', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true, permissions: { location: 'always' } });
        await loginWithOtp();
    });

    it('navigates to payment methods', async () => {
        await element(by.text('Wallet')).tap();
        await waitFor(element(by.text('Payment Methods')))
            .toBeVisible()
            .withTimeout(8000);
        await element(by.text('Payment Methods')).tap();

        await waitFor(element(by.text('Add Card')))
            .toBeVisible()
            .withTimeout(8000);
    });
});
