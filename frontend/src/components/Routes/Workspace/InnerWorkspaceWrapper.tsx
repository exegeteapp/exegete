import { Helmet } from "react-helmet-async";
import { useAppSelector } from "../../../exegete/hooks";
import { selectWorkspaceTitle } from "../../../workspace/Workspace";
import { CellView } from "./CellView";
import { RefsFC } from "./Types";

export const InnerWorkspaceView: RefsFC = ({ refs }) => {
    const title = useAppSelector(selectWorkspaceTitle);

    if (title === undefined) {
        return <p>Loading workspace...</p>;
    }
    return (
        <>
            <Helmet>
                <title>{title} – exegete.app</title>
            </Helmet>
            <CellView refs={refs} />
        </>
    );
};
