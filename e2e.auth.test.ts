import { device, element, by, expect, waitFor } from 'detox';

describe('Authentication Flow', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });
    });

    it('shows onboarding on first launch', async () => {
        await expect(element(by.text('Choose how you pay.'))).toBeVisible();
    });

    it('navigates to the login screen', async () => {
        await element(by.text('Continue to Sign In')).tap();
        await waitFor(element(by.text('Secure Sign In')))
            .toBeVisible()
            .withTimeout(8000);
    });
});
