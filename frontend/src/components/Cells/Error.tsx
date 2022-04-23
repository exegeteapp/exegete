import { CellFC } from "../../workspace/Workspace";

export const Error: CellFC<any> = ({ cell }) => {
    return <div>Error loading cell of type: `{cell.cell_type}`.</div>;
};

export default Error;
