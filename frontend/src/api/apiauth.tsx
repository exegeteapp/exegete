// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getJwt } from "../user/JWT";

// Define a service using a base URL and expected endpoints
export const backendAuthApi = createApi({
    reducerPath: "authapi",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api/v1/",
        prepareHeaders: (headers, { getState }) => {
            // By default, if we have a token in the store, let's use that for authenticated requests
            const token = getJwt();
            if (token) {
                headers.set("Authorization", token.token_type + " " + token.access_token);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({}),
});
