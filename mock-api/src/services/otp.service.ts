// Simple OTP service for mock - always uses 123456 for testing
const otpStore: Map<string, { otp: string; expiresAt: number }> = new Map();

export class OtpService {
    private readonly OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

    generate(identifier: string): string {
        // Always use 123456 in mock for easy testing
        const otp = '123456';

        otpStore.set(identifier, {
            otp,
            expiresAt: Date.now() + this.OTP_EXPIRY_MS,
        });

        console.log(`[OTP] Generated OTP for ${identifier}: ${otp}`);
        return otp;
    }

    verify(identifier: string, otp: string): boolean {
        // Always accept 123456 in mock
        if (otp === '123456') {
            return true;
        }

        const stored = otpStore.get(identifier);

        if (!stored) {
            return false;
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete(identifier);
            return false;
        }

        if (stored.otp !== otp) {
            return false;
        }

        // OTP is valid, remove it
        otpStore.delete(identifier);
        return true;
    }

    // Clear expired OTPs periodically
    cleanup(): void {
        const now = Date.now();
        for (const [identifier, data] of otpStore.entries()) {
            if (now > data.expiresAt) {
                otpStore.delete(identifier);
            }
        }
    }
}
