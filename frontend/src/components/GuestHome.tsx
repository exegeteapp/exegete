import { Row, Button, Col, Container } from "reactstrap";
import { Link } from "react-router-dom";
import Login from "./Login";
import NewWorkspaceButton from "./NewWorkspaceButton";

const WelcomeColumn: React.FC = () => {
    return (
        <Col md={{ size: 7, offset: 0 }}>
            <p className="lead">
                exegete.app is an online environment for Biblical exegesis. A project of{" "}
                <a className="text-muted" href="https://wtc.perth.anglican.org" target="_blank" rel="noreferrer">
                    Wollaston Theological College
                </a>
                , exegete.app is under active development, funded by a grant from{" "}
                <a className="text-muted" href="https://artfinc.org.au/" target="_blank" rel="noreferrer">
                    ARTFinc
                </a>
                .{" "}
                <Link to="/about" className="text-muted">
                    Find out more.
                </Link>
            </p>
            <div className="d-grid gap-2">
                <NewWorkspaceButton local={true} color="success btn-lg">
                    Try exegete.app now!
                </NewWorkspaceButton>
                <p className="text-center">No signup needed.</p>
            </div>
        </Col>
    );
};

const LoginColumn: React.FC = () => {
    return (
        <Col md={{ size: 3, offset: 1 }}>
            <p className="text-center">Already have an account? Sign in.</p>
            <Login />
            <p className="text-center">
                <Link to="/forgotpassword">Forgotten password?</Link>
            </p>
            <div className="d-grid gap-2">
                <hr style={{ margin: "0 0 1rem 0" }} />
                <Button color="success" tag={Link} to="/register">
                    Sign up
                </Button>
            </div>
        </Col>
    );
};

const GuestHome: React.FC = () => {
    return (
        <>
            <Container id="main">
                <h1 className="display-3">Welcome!</h1>
                <Row>
                    <WelcomeColumn />
                    <LoginColumn />
                </Row>
            </Container>
        </>
    );
};

export default GuestHome;
