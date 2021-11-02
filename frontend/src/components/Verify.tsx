import React from 'react';
import { Row, Col, Container } from 'reactstrap';
import { RouteComponentProps } from 'react-router';
import axios from 'axios';

interface VerifyParams {
    token: string
};

function Verify(props: RouteComponentProps<VerifyParams>) {
    const token = props.match.params.token;
    const [message, setMessage] = React.useState("Please wait a moment, your email is being validated.");

    React.useEffect(() => {
        async function bootstrap() {
            try {
                await axios.post('/api/v1/auth/verify', { token: token });
            } catch {
                setMessage("Email verification failed: token is invalid.");
                return;
            }
            setMessage("Thank you for validating your email address.");
        }
        bootstrap();
    },
        [token]
    );

    return <>
        <Container id="main">
            <Row>
                <Col>
                    <p>{message}</p>
                </Col>
            </Row>
        </Container>
    </>;
}

export default Verify;
