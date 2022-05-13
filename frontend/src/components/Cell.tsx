import {
    CardHeader,
    CardBody,
    ButtonGroup,
    Button,
    Row,
    Col,
    Card,
    CardFooter,
    ButtonToolbar,
    UncontrolledTooltip,
} from "reactstrap";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp, faWindowClose } from "@fortawesome/free-solid-svg-icons";
import { IWorkspaceContext, workspaceCellDelete, workspaceCellMove, WorkspaceContext } from "../workspace/Workspace";

export const Cell: React.FC = ({ children }) => {
    return <Card className="mb-4">{children}</Card>;
};

export const CellBody: React.FC = ({ children }) => {
    return <CardBody>{children}</CardBody>;
};

export const CellFooter: React.FC = ({ children }) => {
    return <CardFooter>{children}</CardFooter>;
};

export const CellHeader: React.FC<{ uuid: string; buttons?: JSX.Element[] }> = ({ uuid, children, buttons }) => {
    const { dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);
    const upId = `up${uuid}`;
    const downId = `down${uuid}`;
    const closeId = `close${uuid}`;

    const deleteMe = () => {
        workspaceCellDelete(dispatch, uuid);
    };

    const moveUp = () => {
        workspaceCellMove(dispatch, uuid, -1);
    };

    const moveDown = () => {
        workspaceCellMove(dispatch, uuid, 1);
    };

    return (
        <CardHeader>
            <ButtonToolbar className="float-end mb-1">
                <ButtonGroup className="me-2">{buttons}</ButtonGroup>
                <ButtonGroup>
                    <Button id={upId} color="secondary" className="float-end" onClick={() => moveUp()}>
                        <FontAwesomeIcon icon={faArrowUp} />
                    </Button>
                    <Button id={downId} color="secondary" className="float-end" onClick={() => moveDown()}>
                        <FontAwesomeIcon icon={faArrowDown} />
                    </Button>
                    <Button id={closeId} color="secondary" className="float-end" onClick={() => deleteMe()}>
                        <FontAwesomeIcon icon={faWindowClose} />
                    </Button>
                    <UncontrolledTooltip autohide placement="bottom" target={upId}>
                        Move tool up
                    </UncontrolledTooltip>
                    <UncontrolledTooltip autohide placement="bottom" target={downId}>
                        Move tool down
                    </UncontrolledTooltip>
                    <UncontrolledTooltip autohide placement="bottom" target={closeId}>
                        Remove tool
                    </UncontrolledTooltip>
                </ButtonGroup>
            </ButtonToolbar>
            <Row>
                <Col>{children}</Col>
            </Row>
        </CardHeader>
    );
};
