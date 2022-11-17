import React from "react";
import { Container } from "reactstrap";
import NewWorkspaceButton from "./NewWorkspaceButton";
import WorkspaceList from "./WorkspaceList";
import { useAppSelector } from "../exegete/hooks";
import { selectUser } from "../user/User";
import { useGetWorkspaceQuery } from "../api/apiauth";
import { News } from "./News";

// we want to convert the JSON object described below into
// an object with JS data types
export interface SortableWorkspaceListingMetadata {
    readonly id: string;
    readonly title: string;
    readonly created: Date;
    readonly updated: Date | null;
}

const date_n = (d: string | null) => {
    if (!d) {
        return null;
    }
    return new Date(d);
};

function UserHome() {
    const state = useAppSelector(selectUser);
    const workspaces = useGetWorkspaceQuery(undefined, { refetchOnReconnect: true, refetchOnFocus: true });

    const listing: SortableWorkspaceListingMetadata[] = (workspaces.data || []).map((w) => ({
        ...w,
        created: new Date(w.created),
        updated: date_n(w.updated),
    }));
    listing.sort((a, b) => (b.updated || b.created).getTime() - (a.updated || a.created).getTime());

    return (
        <>
            <Container id="main">
                <h1 className="display-5">Welcome, {state.user?.name}.</h1>
                <NewWorkspaceButton local={false} color="success">
                    Create new workspace
                </NewWorkspaceButton>
                <WorkspaceList workspaces={listing} />
                <div className="pt-4">
                    <News />
                </div>
            </Container>
        </>
    );
}

export default UserHome;
