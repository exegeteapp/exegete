import React from "react";
import { Row, Col, Container } from "reactstrap";
import axios from "axios";
import { useParams } from "react-router";
import Header from "./Header";
import { Helmet } from "react-helmet-async";
import { Footer } from "./Footer";

function Verify() {
    const { token } = useParams();
    const [message, setMessage] = React.useState("Please wait a moment, your email is being validated.");

    React.useEffect(() => {
        async function bootstrap() {
            try {
                await axios.post("/api/v1/auth/verify", { token: token });
            } catch {
                setMessage("Email verification failed: token is invalid.");
                return;
            }
            setMessage("Thank you for validating your email address.");
        }
        bootstrap();
    }, [token]);

    return (
        <>
            <Header />
            <Helmet>
                <title>Verify email - exegete.app</title>
            </Helmet>
            <Container id="main">
                <Row>
                    <Col>
                        <p>{message}</p>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </>
    );
}

export default Verify;
