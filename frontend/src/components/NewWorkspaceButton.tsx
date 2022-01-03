
import React from 'react';
import { Button } from 'reactstrap';
import { createWorkspaceAPI } from '../workspace/APIWorkspaceStorage';
import { useNavigate } from 'react-router';
import { createWorkspaceLocal } from '../workspace/LocalWorkspaceStorage';

export const NewWorkspaceButton: React.FC<{local: boolean, color: string}> = ({ local, children, color }) => {
    const navigate = useNavigate();

    const createWorkspace = async () => {
        var id;
        if (local) {
            id = createWorkspaceLocal();
        } else {
            id = await createWorkspaceAPI();
        }
        navigate(`/workspace/${id}`);
    };

    return <Button color={color} onClick={createWorkspace}>{ children }</Button>
}

export default NewWorkspaceButton;
