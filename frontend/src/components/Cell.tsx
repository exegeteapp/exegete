import { CardHeader, CardBody, ButtonGroup, Button, Row, Col, Card, CardFooter, ButtonToolbar } from "reactstrap";
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
    children,
    functions,
    buttons,
}) => {
    return (
        <CardHeader>
            <ButtonToolbar className="float-end mb-1">
                <ButtonGroup>{buttons}</ButtonGroup>
                <ButtonGroup>
                    <Button color="secondary" className="float-end" onClick={() => functions.moveUp()}>
                        <FontAwesomeIcon icon={faArrowUp} />
                    </Button>
                    <Button color="secondary" className="float-end" onClick={() => functions.moveDown()}>
                        <FontAwesomeIcon icon={faArrowDown} />
                    </Button>
                    <Button color="secondary" className="float-end" onClick={() => functions.delete()}>
                        <FontAwesomeIcon icon={faWindowClose} />
                    </Button>
                </ButtonGroup>
            </ButtonToolbar>
            <Row>
                <Col>{children}</Col>
            </Row>
        </CardHeader>
    );
};
