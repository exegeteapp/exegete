import { Table } from "reactstrap";
import { Link } from "react-router-dom";
import { SortableWorkspaceListingMetadata } from "./Routes/Home/UserHome";

const WorkspaceList = ({ workspaces }: { workspaces: SortableWorkspaceListingMetadata[] }) => {
    const render_date = (d: Date | null) => {
        if (!d) {
            return "";
        }
        return d.toLocaleString();
    };
    if (!workspaces) {
        return <></>;
    }
    const tableRows = workspaces.map((workspace) => (
        <tr key={workspace.id}>
            <td>
                <Link to={"/workspace/" + workspace.id}>{workspace.title}</Link>
            </td>
            <td>{render_date(workspace.created)}</td>
            <td>{render_date(workspace.updated)}</td>
        </tr>
    ));

    return (
        <Table striped>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Created</th>
                    <th>Updated</th>
                </tr>
            </thead>
            <tbody>{tableRows}</tbody>
        </Table>
    );
};

export default WorkspaceList;
