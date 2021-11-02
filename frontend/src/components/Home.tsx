import { Input, Form, FormGroup, Label, Row, Button, Col, Container } from 'reactstrap';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

function Home(props: RouteComponentProps) {
    return <>
        <Container id="main">
            <h1 className="display-3">Welcome!</h1>
            <Row>
                <Col md={{ size: 7, offset: 0 }}>
                    <p className="lead">
                        exegete.app is an online environment for biblical exegesis, currently under active development.
                    </p>
                    <div className="d-grid gap-2">
                        <Button color="success btn-lg">Try exegete.app now!</Button>
                        <p className="text-center">No signup needed.</p>
                    </div>
                </Col>
                <Col md={{ size: 3, offset: 1 }}>
                    <p className="text-center">Already have an account? Sign in.</p>
                    <Form inline>
                        <FormGroup>
                            <Label
                                for="email"
                                hidden
                            >
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                placeholder="Email"
                                type="email"
                            />
                        </FormGroup>
                        {' '}
                        <FormGroup>
                            <Label
                                for="password"
                                hidden
                            >
                                Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                placeholder="Password"
                                type="password"
                            />
                        </FormGroup>
                        <div className="d-grid gap-2">
                            <Button color="primary">Log in</Button>
                            <p className="text-center">Forgotten password?</p>
                            <hr style={{ margin: "0 0 1rem 0" }} />
                            <Button color="success" tag={Link} to="/register">Create New Account</Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    </>;
}

export default Home;
