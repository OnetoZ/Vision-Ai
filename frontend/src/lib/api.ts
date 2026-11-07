/**
 * API Client for FastAPI backend
 */

const getApiUrl = () => {
    let base = (import.meta.env.VITE_API_URL || '/api').trim();
    return base.replace(/\/+$/, '');
};

export class ApiError extends Error {
    status: number;
    data: unknown;

    constructor(status: number, message: string, data: unknown = null) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = 'ApiError';
    }
}

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const base = getApiUrl();
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    if (base === '/api' || base.endsWith('/api')) {
        if (cleanEndpoint.startsWith('/api/')) {
            cleanEndpoint = cleanEndpoint.replace(/^\/api/, '');
        }
    } else if (base.startsWith('http') && !cleanEndpoint.startsWith('/api')) {
        cleanEndpoint = `/api${cleanEndpoint}`;
    }

    const url = `${base}${cleanEndpoint}`;
    
    // Add default headers
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    // Add auth token if exists
    const token = localStorage.getItem('vision_ai_token');
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    let data;
    try {
        data = await response.json();
    } catch (error: unknown) {
        data = null;
    }

    if (!response.ok) {
        const message = data?.detail || response.statusText || 'An error occurred';
        throw new ApiError(response.status, message, data);
    }

    return data;
};
