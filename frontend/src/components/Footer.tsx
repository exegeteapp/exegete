import { Col, Container, Row } from "reactstrap";
import { Link } from "react-router-dom";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons";

export const Footer: React.FC = ({ children }) => {
    return (
        <Container className="footer-padding border-top" sm={{ offset: 2, size: 10 }}>
            <Row className="pt-4">
                <Col sm={{ offset: 3, size: 3 }}>
                    <h5>
                        <FontAwesomeIcon icon={faBookOpen} /> exegete.app
                    </h5>
                </Col>
                <Col sm={{ size: 3 }}>
                    <h5>About</h5>
                    <ul className="list-unstyled text-small">
                        <li>
                            <Link className="text-muted" to="/about">
                                About
                            </Link>
                        </li>
                        <li>
                            <a
                                className="text-muted"
                                target="_blank"
                                rel="noreferrer"
                                href="https://forms.gle/dkxWrAh9m1rw3rbq8"
                            >
                                Provide feedback
                            </a>
                        </li>
                        <li>
                            <Link className="text-muted" to="/privacy">
                                Privacy
                            </Link>
                        </li>
                        <li>
                            <Link className="text-muted" to="/disclaimer">
                                Disclaimer
                            </Link>
                        </li>
                    </ul>
                </Col>
            </Row>
        </Container>
    );
};
