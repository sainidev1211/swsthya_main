// src/api/config.js
// Centralized API configuration for environment-aware routing
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5005';
