const SibApiV3Sdk = require('@sendinblue/client');

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

/**
 * Send OTP email using Brevo API
 */
const sendOTPEmail = async (email, otp, username) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = 'Verify Your Email - Saturn Platform';
    sendSmtpEmail.to = [{ email: email, name: username || 'User' }];
    sendSmtpEmail.sender = {
        name: process.env.BREVO_SENDER_NAME || 'Saturn Platform',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@yourplatform.com'
    };
    sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Courier New', monospace; background-color: #0a0a0a; color: #e0e0e0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid #333; padding: 30px; }
                .header { color: #00ff00; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                .otp-box { background-color: #0a0a0a; border: 2px solid #00ff00; padding: 20px; text-align: center; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #00ff00; letter-spacing: 8px; }
                .footer { font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #333; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">🛡️ Saturn Platform - Email Verification</div>
                <p>Hello ${username || 'User'},</p>
                <p>Your One-Time Password (OTP) for email verification is:</p>
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                </div>
                <p><strong>This code will expire in 10 minutes.</strong></p>
                <p>If you didn't request this code, please ignore this email.</p>
                <div class="footer">
                    <p>This is an automated message from Saturn Platform.</p>
                    <p>Do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('OTP email sent via Brevo:', data.messageId);
        return { success: true, messageId: data.messageId };
    } catch (error) {
        console.error('Error sending OTP email via Brevo:', error);
        return { success: false, error: error.message || 'Failed to send email' };
    }
};

/**
 * Verify Brevo API connection
 */
const verifyConnection = async () => {
    try {
        const accountApi = new SibApiV3Sdk.AccountApi();
        accountApi.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;
        await accountApi.getAccount();
        console.log('✅ Brevo API is ready to send emails');
        return true;
    } catch (error) {
        console.error('❌ Brevo API connection failed:', error);
        return false;
    }
};

module.exports = {
    sendOTPEmail,
    verifyConnection
};
