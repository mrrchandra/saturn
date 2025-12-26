module.exports = {
    domain: 'otp',
    functions: {
        'otp.send': {
            description: 'Send OTP for email verification',
            handler: 'otpController.sendOTP',
            requiresAuth: false,
            rateLimitTier: 'critical'
        },
        'otp.verify': {
            description: 'Verify OTP code',
            handler: 'otpController.verifyOTP',
            requiresAuth: false,
            rateLimitTier: 'high'
        }
    }
};
