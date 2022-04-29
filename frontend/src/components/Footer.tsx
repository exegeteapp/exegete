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
                    &copy; 2022{" "}
                    <a className="text-muted" href="https://perth.anglican.org/" target="_blank" rel="noreferrer">
                        Anglican Diocese of Perth
                    </a>
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
