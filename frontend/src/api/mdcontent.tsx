// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const mdcontentApi = createApi({
    reducerPath: "mdcontent",
    baseQuery: fetchBaseQuery({ baseUrl: "/md-content/" }),
    endpoints: (builder) => ({
        getNews: builder.query<string, void>({
            query: () => ({
                url: "news.md",
                responseHandler: (response) => response.text(),
            }),
        }),
    }),
});

export const { useGetNewsQuery } = mdcontentApi;
