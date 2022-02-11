import { CardHeader, CardBody, ButtonGroup, Button, Row, Col, Card } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp, faWindowClose } from "@fortawesome/free-solid-svg-icons";
import { CellFunctions } from "../workspace/Workspace";

export interface ScriptureCellData {
    shortcode: string;
    verseref: string;
}

export const Cell: React.FC = ({ children }) => {
    return <Card className="mb-4">{children}</Card>;
};

export const CellBody: React.FC = ({ children }) => {
    return <CardBody>{children}</CardBody>;
};

export const CellHeader: React.FC<{ functions: CellFunctions; uuid: string }> = ({ children, functions }) => {
    return (
        <CardHeader>
            <ButtonGroup className="float-end mb-1">
                <Button color="secondary" className="float-end">
                    <FontAwesomeIcon icon={faArrowUp} onClick={() => functions.moveUp()} />
                </Button>
                <Button color="secondary" className="float-end">
                    <FontAwesomeIcon icon={faArrowDown} onClick={() => functions.moveDown()} />
                </Button>
                <Button color="danger" className="float-end">
                    <FontAwesomeIcon icon={faWindowClose} onClick={() => functions.delete()} />
                </Button>
            </ButtonGroup>
            <Row>
                <Col>{children}</Col>
            </Row>
        </CardHeader>
    );
};
