const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const db = require('../../core/db');

class NotifyService {
    constructor() {
        // Initialize Firebase (if service account is available)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);
                if (!admin.apps.length) {
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount)
                    });
                }
            } catch (e) {
                console.warn("Firebase Init Error:", e.message);
            }
        }

        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    /**
     * Send email notification
     */
    async sendEmail(to, subject, body, userId) {
        await this.transporter.sendMail({
            from: `"Saturn Platform" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text: body,
        });

        // Log notification
        await db.query(
            'INSERT INTO Notifications (user_id, type, status, payload) VALUES ($1, $2, $3, $4)',
            [userId, 'email', 'sent', JSON.stringify({ to, subject })]
        );

        return true;
    }

    /**
     * Send push notification
     */
    async sendPush(token, title, body, userId) {
        if (!admin.apps.length) {
            throw new Error('Firebase not initialized');
        }

        const message = { notification: { title, body }, token };
        await admin.messaging().send(message);

        // Log notification
        await db.query(
            'INSERT INTO Notifications (user_id, type, status, payload) VALUES ($1, $2, $3, $4)',
            [userId, 'push', 'sent', JSON.stringify({ title, body })]
        );

        return true;
    }

    /**
     * Subscribe to push notifications (FCM token)
     */
    async subscribe(userId, token) {
        await db.query(
            'INSERT INTO AuthTokens (user_id, token, type) VALUES ($1, $2, $3)',
            [userId, token, 'fcm_token']
        );
        return true;
    }
}

module.exports = new NotifyService();
