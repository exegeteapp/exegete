import { useNavigate } from "react-router-dom";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { downloadWorkspaceAPI } from "../../../workspace/APIWorkspaceStorage";

export const WorkspaceMenu: React.FC<
    React.PropsWithChildren<{
        id: string | undefined;
        title: string;
        setShowRenameWorkspaceModal: React.Dispatch<React.SetStateAction<boolean>>;
        setShowDeleteWorkspaceModal: React.Dispatch<React.SetStateAction<boolean>>;
    }>
> = ({ id, title, setShowRenameWorkspaceModal, setShowDeleteWorkspaceModal }) => {
    const navigate = useNavigate();
    const downloadWorkspace = () => {
        if (id) {
            downloadWorkspaceAPI(id, title);
        }
    };
    return (
        <UncontrolledDropdown nav>
            <DropdownToggle caret nav>
                Workspace: {title}
            </DropdownToggle>
            <DropdownMenu md-end={"true"} color="dark" dark>
                <DropdownItem onClick={() => setShowRenameWorkspaceModal(true)}>Rename</DropdownItem>
                <DropdownItem onClick={() => setShowDeleteWorkspaceModal(true)}>Delete</DropdownItem>
                <DropdownItem onClick={() => downloadWorkspace()}>Download</DropdownItem>
                <DropdownItem onClick={() => navigate("/")}>Close</DropdownItem>
            </DropdownMenu>
        </UncontrolledDropdown>
    );
};
