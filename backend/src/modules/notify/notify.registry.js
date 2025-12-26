module.exports = {
    domain: 'notify',
    functions: {
        'notify.email': {
            description: 'Send an email notification',
            handler: 'notifyController.sendEmail',
            requiresAuth: true,
            rateLimitTier: 'medium'
        },
        'notify.push': {
            description: 'Send a push notification',
            handler: 'notifyController.sendPush',
            requiresAuth: true,
            rateLimitTier: 'medium'
        },
        'notify.subscribe': {
            description: 'Subscribe to push notifications',
            handler: 'notifyController.subscribe',
            requiresAuth: true,
            rateLimitTier: 'low'
        }
    }
};
