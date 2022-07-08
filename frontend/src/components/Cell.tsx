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
import { selectWorkspaceGlobal, TextSize, workspaceCellDelete, workspaceCellMove } from "../workspace/Workspace";
import { useAppDispatch, useAppSelector } from "../exegete/hooks";

export const Cell: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    const global = useAppSelector(selectWorkspaceGlobal);

    let textSize = TextSize.MEDIUM;
    if (global) {
        textSize = global.view.textSize;
    }
    // paranoia: cross-validate that the level is one in the enum, as we're writing a class into the DOM
    const levels = Object.values(TextSize);
    const currentIndex = levels.indexOf(textSize);
    const fontClass = currentIndex !== -1 ? `text-${textSize}` : "text-medium";
    return <Card className={"mb-4 " + fontClass}>{children}</Card>;
};

export const CellBody: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    return <CardBody>{children}</CardBody>;
};

export const CellFooter: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    return <CardFooter>{children}</CardFooter>;
};

export const CellHeader: React.FC<React.PropsWithChildren<{ uuid: string; buttons?: JSX.Element[] }>> = ({
    uuid,
    children,
    buttons,
}) => {
    const dispatch = useAppDispatch();
    const upId = `up${uuid}`;
    const downId = `down${uuid}`;
    const closeId = `close${uuid}`;

    const deleteMe = () => {
        dispatch(workspaceCellDelete(uuid));
    };

    const moveUp = () => {
        dispatch(workspaceCellMove([uuid, -1]));
    };

    const moveDown = () => {
        dispatch(workspaceCellMove([uuid, 1]));
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
