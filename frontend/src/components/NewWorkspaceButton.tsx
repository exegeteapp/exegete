import React from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router";
import { createWorkspace } from "../workspace/WorkspaceProvider";

export const NewWorkspaceButton: React.FC<
    React.PropsWithChildren<{
        local: boolean;
        color: string;
    }>
> = ({ local, children, color }) => {
    const navigate = useNavigate();

    const makeNew = async () => {
        const id = await createWorkspace(local);
        navigate(`/workspace/${id}`);
    };

    return (
        <Button color={color} onClick={makeNew}>
            {children}
        </Button>
    );
};

export default NewWorkspaceButton;
