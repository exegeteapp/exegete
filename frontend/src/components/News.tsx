import React from "react";
import ReactMarkdown from "react-markdown";

export const News: React.FC<React.PropsWithChildren<unknown>> = () => {
    const [news, setNews] = React.useState<string>("");

    React.useEffect(() => {
        fetch("/news.md")
            .then((response) => response.text())
            .then((text) => setNews(text));
    }, []);

    return (
        <>
            <h1 className="display-5">News</h1>
            <ReactMarkdown children={news} />
        </>
    );
};
