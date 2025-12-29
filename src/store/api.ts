import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Config from 'react-native-config';

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: Config.API_BASE_URL,
    }),
    endpoints: () => ({}),
    tagTypes: ['Auth', 'User', 'Notifications'],
});

export type BaseApi = typeof baseApi;
