export const API_DOCS = [
    {
        domain: 'Authentication',
        endpoints: [
            {
                name: 'Standard Login',
                path: '/api/auth/login',
                method: 'POST',
                description: 'Authenticates a user and establishes a secure session via HttpOnly cookies.',
                usage: 'Send a JSON payload with email and password. Ensure your request includes include-credentials if using a cross-origin SDK.',
                howItWorks: 'The platform compares the provided password hash (Argon2ID) against the stored hash. If matched, it generates a cryptographically secure JWT and persists it in a strictly secure cookie.',
                requestBody: {
                    email: 'developer@saturn.com',
                    password: 'securePassword_2024'
                },
                response: {
                    success: true,
                    data: {
                        user: { id: 'usr_812', email: 'dev@saturn.com', name: 'Saturn Developer' },
                        session_expires: '2024-12-31T23:59:59Z'
                    }
                }
            },
            {
                name: 'Account Registration',
                path: '/api/auth/register',
                method: 'POST',
                description: 'Registers a new developer account and initializes a default project integration.',
                usage: 'Submit required profile fields. Password must meet complexity requirements (8+ chars, 1 special char).',
                howItWorks: 'Sanitizes input, creates a unique UUID for the user, and triggers an automated welcome email sequence via the Notify service.',
                requestBody: {
                    email: 'new_dev@example.com',
                    password: 'ComplexityPassword!123',
                    name: 'Project Alpha'
                },
                response: {
                    success: true,
                    message: 'Registration successful. Please verify your email.'
                }
            },
            {
                name: 'Identity Check (Me)',
                path: '/api/auth/me',
                method: 'GET',
                description: 'Returns the current context of the authenticated user.',
                usage: 'Useful for initializing dashboard states or checking if a session is still valid.',
                howItWorks: 'Decodes the session cookie on the server, verifies its signature against the project secret, and returns the current user profile.',
                requestBody: null,
                response: {
                    success: true,
                    data: {
                        user: { id: 'usr_812', role: 'developer' }
                    }
                }
            }
        ]
    },
    {
        domain: 'Profile & Assets',
        endpoints: [
            {
                name: 'Profile Insights',
                path: '/api/user/details',
                method: 'GET',
                description: 'Retrieves extended metadata and integration statistics for a user profile.',
                usage: 'Call this after login to populate user profile screens with deep metadata.',
                howItWorks: 'Performs a join across users, user_metadata, and integrations tables to provide a unified identity graph.',
                requestBody: null,
                response: {
                    success: true,
                    data: {
                        profile: { bio: 'Fullstack Architect', github_handle: 'saturn-dev' },
                        active_integrations: 14
                    }
                }
            },
            {
                name: 'Avatar Update',
                path: '/api/auth/upload-pfp',
                method: 'POST',
                description: 'Updates the account profile picture with automated optimization.',
                usage: 'Upload an image (PNG/JPG, max 5MB). The platform handles cropping and CDN delivery.',
                howItWorks: 'Uses the Sharp processing engine to generate multiple WebP variants of the upload for global CDN distribution.',
                requestBody: 'Multipart/FormData: { image: File }',
                response: {
                    success: true,
                    data: {
                        avatar_url: 'https://cdn.saturn.com/pfp/usr_812_v2.webp',
                        thumb_url: 'https://cdn.saturn.com/pfp/usr_812_thumb.webp'
                    }
                }
            }
        ]
    },
    {
        domain: 'Security & OTP',
        endpoints: [
            {
                name: 'Trigger Verification',
                path: '/api/otp/send',
                method: 'POST',
                description: 'Dispatches a high-entropy 6-digit code for multi-factor verification.',
                usage: 'Call this before sensitive operations like password resets or email changes.',
                howItWorks: 'Generates a temporary code, salts it, and stores it in a redis-backed cache with a 5-minute TTL.',
                requestBody: { email: 'user@example.com' },
                response: { success: true, message: 'OTP has been dispatched' }
            },
            {
                name: 'Validate Challenge',
                path: '/api/otp/verify',
                method: 'POST',
                description: 'Confirms a user-submitted OTP challenge.',
                usage: 'Submit the code exactly as received. Codes are case-sensitive if alphabetic.',
                howItWorks: 'Matches the input against the encrypted cache record. On success, invalidates the code immediately.',
                requestBody: { email: 'user@example.com', code: '882193' },
                response: { success: true, message: 'Verification successful' }
            }
        ]
    },
    {
        domain: 'Integrations',
        endpoints: [
            {
                name: 'Project Registry',
                path: '/api/integrations/list-projects',
                method: 'GET',
                description: 'Lists all external application integration profiles.',
                usage: 'Retrieve this list to manage API keys and production status per project.',
                howItWorks: 'Queries the Integrations microservice for all rows associated with the current developer ID.',
                requestBody: null,
                response: {
                    success: true,
                    data: [
                        { id: 1, name: 'Main API', status: 'live' },
                        { id: 2, name: 'Beta Sandbox', status: 'maintenance' }
                    ]
                }
            },
            {
                name: 'Register Project',
                path: '/api/integrations/add-project',
                method: 'POST',
                description: 'Bootstraps a new Saturn integration with a unique API key.',
                usage: 'Identify your project name and default production environment.',
                howItWorks: 'Creates a project entry and generates a 48-character high-entropy API key for secure communication.',
                requestBody: { name: 'New Mobile App' },
                response: {
                    success: true,
                    data: { id: 10, apiKey: 'saturn_live_8a2b...' }
                }
            },
            {
                name: 'Update Origins',
                path: '/api/integrations/save-origins',
                method: 'POST',
                description: 'Configures the CORS whitelist for a specific project.',
                usage: 'Submit a list of allowed origins (e.g., https://yourapp.com).',
                howItWorks: 'Persists the origin list to the database, which is cached by the ProjectCORS middleware for instant validation.',
                requestBody: { projectId: 10, allowed_origins: ['https://myapp.com', 'http://localhost:3000'] },
                response: { success: true, message: 'Origins updated successfully' }
            }
        ]
    },
    {
        domain: 'Webhooks & Notify',
        endpoints: [
            {
                name: 'Event Subscription',
                path: '/api/notify/subscribe',
                method: 'POST',
                description: 'Subscribes an endpoint to platform events (e.g., user.registered, auth.fail).',
                usage: 'Provide a delivery URL and a list of event tokens to listen for.',
                howItWorks: 'Registers your webhook in the notification dispatcher. Events are sent via POST with a signed HMAC header for security.',
                requestBody: {
                    url: 'https://your-server.com/webhooks',
                    events: ['user.registered', 'project.created']
                },
                response: { success: true, subscription_id: 'sub_9921' }
            }
        ]
    }
];
