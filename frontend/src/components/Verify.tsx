import React from 'react';
import { Row, Col, Container } from 'reactstrap';
import axios from 'axios';
import { useParams } from 'react-router';

function Verify() {
    const {token} = useParams();
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
