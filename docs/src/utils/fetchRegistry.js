import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Fetches the function registry from the backend and converts it to a documentation-friendly format.
 */
export const fetchDocumentationData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/registry`);
        const registry = response.data.data;

        // Convert the registry object into an array of documentation entries
        const endpoints = Object.entries(registry).map(([name, config]) => {
            return {
                name,
                domain: config.domain,
                path: config.path || `/api/${config.domain}/${name.split('.')[1]}`,
                method: config.method || 'POST',
                description: config.description || 'No description provided.',
                requiresAuth: config.requiresAuth || false,
                rateLimit: config.rateLimitTier || 'standard',
                requestExample: config.requestExample || {},
                responseExample: config.responseExample || { success: true, data: {} }
            };
        });

        // Group by domain for easier navigation
        const grouped = endpoints.reduce((acc, ep) => {
            if (!acc[ep.domain]) acc[ep.domain] = [];
            acc[ep.domain].push(ep);
            return acc;
        }, {});

        return {
            endpoints,
            grouped
        };
    } catch (error) {
        console.error('Error fetching registry:', error);
        return { endpoints: [], grouped: {} };
    }
};
