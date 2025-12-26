import axios from 'axios';
import { Config } from 'react-native-config';

export const apiClient = axios.create({
    baseURL: Config.API_URL || 'http://localhost:3000/api', // Default to localhost if config not loaded
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// We'll add interceptors for token management in TASK-007
