import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Config from 'react-native-config';

const BASE_URL = Config.API_BASE_URL || Config.API_URL || 'http://localhost:3001/api/v1';

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    endpoints: () => ({}),
    tagTypes: ['Auth', 'User', 'Notifications'],
});

export type BaseApi = typeof baseApi;
