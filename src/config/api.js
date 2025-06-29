const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    USER_PROFILE: `${API_BASE_URL}/api/users`,
};

export const FLARE_PREDICTION_API = {
    predict: '/api/predict-flare',
    analyze: '/analyze'
};

export default API_ENDPOINTS; 