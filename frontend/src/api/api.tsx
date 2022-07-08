// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ScriptureCatalog } from "../scripture/ScriptureCatalog";

interface Config {
    recaptcha_site_key: string;
}

// Define a service using a base URL and expected endpoints
export const backendApi = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1/" }),
    endpoints: (builder) => ({
        getConfig: builder.query<Config, void>({
            query: () => "config",
        }),
        getScriptureCatalog: builder.query<ScriptureCatalog, void>({
            query: () => "scripture/catalog",
        }),
    }),
});

export const { useGetConfigQuery, useGetScriptureCatalogQuery } = backendApi;
