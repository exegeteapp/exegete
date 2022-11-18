import React from "react";
import ReactMarkdown from "react-markdown";
import { useGetNewsQuery } from "../api/mdcontent";

export const News: React.FC<React.PropsWithChildren<unknown>> = () => {
    const { data: news } = useGetNewsQuery();

    return (
        <>
            <h1 className="display-5">News</h1>
            <ReactMarkdown children={news || ""} />
        </>
    );
};
