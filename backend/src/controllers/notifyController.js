const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');

// Initialize Firebase (if service account is available)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (e) {
        console.warn("Firebase Init Error:", e.message);
    }
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

exports.sendEmail = asyncHandler(async (req, res) => {
    const { to, subject, body, user_id } = req.body;

    await transporter.sendMail({
        from: `"Saturn Platform" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text: body,
    });

    // Log notification
    await db.query(
        'INSERT INTO Notifications (user_id, type, status, payload) VALUES ($1, $2, $3, $4)',
        [user_id, 'email', 'sent', JSON.stringify({ to, subject })]
    );

    return success(res, null, 'Email sent successfully');
});

exports.sendPush = asyncHandler(async (req, res) => {
    const { token, title, body, user_id } = req.body;

    if (!admin.apps.length) {
        return error(res, 'Config missing', 'Firebase not initialized', 500);
    }

    const message = { notification: { title, body }, token };
    await admin.messaging().send(message);

    // Log notification
    await db.query(
        'INSERT INTO Notifications (user_id, type, status, payload) VALUES ($1, $2, $3, $4)',
        [user_id, 'push', 'sent', JSON.stringify({ title, body })]
    );

    return success(res, null, 'Push notification sent successfully');
});

exports.subscribe = asyncHandler(async (req, res) => {
    const { user_id, token } = req.body;

    await db.query(
        'INSERT INTO AuthTokens (user_id, token, type) VALUES ($1, $2, $3)',
        [user_id, token, 'fcm_token']
    );

    return success(res, null, 'Subscribed to push notifications');
});
