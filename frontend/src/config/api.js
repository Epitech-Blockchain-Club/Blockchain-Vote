// Centralized API configuration for dynamic environment switching
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Ensure no trailing slash for consistency
export const API_BASE_URL = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

export const API_ROUTES = {
    SCRUTINS: `${API_BASE_URL}/api/scrutins`,
    AUTH: `${API_BASE_URL}/api/auth`,
    VOTES: `${API_BASE_URL}/api/votes`,
    MODERATORS: `${API_BASE_URL}/api/moderators`,
    REQUEST_VOTE: `${API_BASE_URL}/api/request-vote`,
    SUPERADMIN: `${API_BASE_URL}/api/superadmin`,
};

export default API_BASE_URL;
