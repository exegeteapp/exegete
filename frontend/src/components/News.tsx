import React from "react";
import ReactMarkdown from "react-markdown";

const NewsMD = `
**3 Dec 2022:** Click or tap on any scripture word and a new intertexture menu will appear. You can search the [Perseus Digital Library](http://www.perseus.tufts.edu/) for any English word, or open the Greek word study tool.

**19 Nov 2022:** Gospel Parallels can be added from the database by double-clicking an entry in the popup dialog (as well as by clicking 'Open'). The interface will now scroll to the newly-added parallel.

**17 Nov 2022:** The highlight repetition tool can now be toggled on and off. Click on the icon in the Scripture Viewer toolbar to toggle on automatically generated highlighting of repeated words; click on it a second time, and these annotations will disappear. Any annotations you have made yourself will be unaffected, and will always take precedence over the automatically generated annotations.
`;

export const News: React.FC<React.PropsWithChildren<unknown>> = () => {
    return (
        <>
            <h1 className="display-5">News</h1>
            <ReactMarkdown
                children={NewsMD}
                components={{
                    a: ({ node, children, ...props }) => {
                        const linkProps = props;
                        linkProps["target"] = "_blank";
                        linkProps["rel"] = "noopener noreferrer";
                        return <a {...linkProps}>{children}</a>;
                    },
                }}
            />
        </>
    );
};
