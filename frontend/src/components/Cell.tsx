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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp, faWindowClose } from "@fortawesome/free-solid-svg-icons";
import { CellFunctions } from "../workspace/Workspace";

export const Cell: React.FC = ({ children }) => {
    return <Card className="mb-4">{children}</Card>;
};

export const CellBody: React.FC = ({ children }) => {
    return <CardBody>{children}</CardBody>;
};

export const CellFooter: React.FC = ({ children }) => {
    return <CardFooter>{children}</CardFooter>;
};

export const CellHeader: React.FC<{ functions: CellFunctions; uuid: string; buttons?: JSX.Element[] }> = ({
    uuid,
    children,
    functions,
    buttons,
}) => {
    const upId = `up${uuid}`;
    const downId = `down${uuid}`;
    const closeId = `close${uuid}`;
    return (
        <CardHeader>
            <ButtonToolbar className="float-end mb-1">
                <ButtonGroup className="me-2">{buttons}</ButtonGroup>
                <ButtonGroup>
                    <Button id={upId} color="secondary" className="float-end" onClick={() => functions.moveUp()}>
                        <FontAwesomeIcon icon={faArrowUp} />
                    </Button>
                    <Button id={downId} color="secondary" className="float-end" onClick={() => functions.moveDown()}>
                        <FontAwesomeIcon icon={faArrowDown} />
                    </Button>
                    <Button id={closeId} color="secondary" className="float-end" onClick={() => functions.delete()}>
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
