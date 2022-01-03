import { Row, Button, Col, Container } from 'reactstrap';
import { Link } from 'react-router-dom';
import Login from './Login';
import NewWorkspaceButton from './NewWorkspaceButton';

function GuestHome() {
    return <>
        <Container id="main">
            <h1 className="display-3">Welcome!</h1>
            <Row>
                <Col md={{ size: 7, offset: 0 }}>
                    <p className="lead">
                        exegete.app is an online environment for biblical exegesis, currently under active development.
                    </p>
                    <div className="d-grid gap-2">
                        <NewWorkspaceButton local={true} color="success btn-lg">Try exegete.app now!</NewWorkspaceButton>
                        <p className="text-center">No signup needed.</p>
                    </div>
                </Col>
                <Col md={{ size: 3, offset: 1 }}>
                    <p className="text-center">Already have an account? Sign in.</p>
                    <Login />
                    <div className="d-grid gap-2">
                        <p className="text-center"><Link to="/forgotpassword">Forgotten password?</Link></p>
                        <hr style={{ margin: "0 0 1rem 0" }} />
                        <Button color="success" tag={Link} to="/register">Create New Account</Button>
                    </div>
                </Col>
            </Row>
        </Container>
    </>;
}

export default GuestHome;
