import { Button, Col, Container, Row } from "reactstrap";
import { Footer } from "./Footer";
import Header from "./Header";
import React from "react";
import { IScriptureContext, ScriptureContext } from "../scripture/Scripture";
import { Link } from "react-router-dom";

const AboutText: React.FC<React.PropsWithChildren<unknown>> = () => {
    return (
        <>
            <p className="lead">
                exegete.app is an online environment for Biblical exegesis. A project of{" "}
                <a className="text-muted" href="http://wtc.perth.anglican.org" target="_blank" rel="noreferrer">
                    Wollaston Theological College
                </a>
                , exegete.app is under active development, funded by a grant from{" "}
                <a className="text-muted" href="https://artfinc.org.au/" target="_blank" rel="noreferrer">
                    ARTFinc
                </a>
                .
            </p>
            <p>
                We aim to enable close reading of Biblical texts, assisting the identification of linguistic patterns,
                structural elements, and intertextual phenomena, including redactional parallels, within a selected
                pericope.
            </p>
            <p>
                Existing Bible study software can be expensive. exegete.app is free software - this website is free to
                use, and the{" "}
                <a className="text-muted" href="https://github.com/exegeteapp/exegete/">
                    software which drives it
                </a>{" "}
                is free and open source. Feedback can be provided by logging an issue on our{" "}
                <a className="text-muted" href="https://github.com/exegeteapp/exegete/issues">
                    GitHub page
                </a>
                .
            </p>
        </>
    );
};

const Texts: React.FC<React.PropsWithChildren<unknown>> = () => {
    const { state } = React.useContext<IScriptureContext>(ScriptureContext);
    if (!state.valid || !state.catalog) {
        return <></>;
    }
    const catalog = state.catalog;

    const entries = () => {
        return Object.keys(catalog).map((module, i) => {
            const entry = catalog[module];
            const target = `/module/${module}`;
            return (
                <li>
                    <Link className="text-muted" to={target}>
                        {entry.name}
                    </Link>
                </li>
            );
        });
    };
    return (
        <div>
            <p>The following texts are available within exegete.app:</p>
            <ul>{entries()}</ul>
        </div>
    );
};

const SponsorLogos: React.FC<React.PropsWithChildren<unknown>> = () => {
    return (
        <>
            <Col md={{ size: 2, offset: 2 }} className="text-center">
                <h1>
                    <a className="text-muted" href="https://artfinc.org.au/" target="_blank" rel="noreferrer">
                        ARTFinc
                    </a>
                </h1>
            </Col>
            <Col md={{ size: 2, offset: 1 }}>
                <a className="text-muted" href="http://wtc.perth.anglican.org/" target="_blank" rel="noreferrer">
                    <img src="/sponsors/wollaston.png" alt="Wollaston Theological College" />
                </a>
            </Col>
            <Col md={{ size: 2, offset: 1 }}>
                <a className="text-muted" href="https://perth.anglican.org/" target="_blank" rel="noreferrer">
                    <img src="/sponsors/anglican.png" alt="Wollaston Theological College" />
                </a>
            </Col>
        </>
    );
};

const Bios: React.FC<React.PropsWithChildren<unknown>> = () => {
    return (
        <>
            <Row className="team">
                <Col md={{ size: 6, offset: 0 }} className="border-right">
                    <h3>Dr Robert Myles</h3>
                    <h5>Academic Lead</h5>
                    <p>
                        Dr Robert J. Myles is a Senior Lecturer in New Testament at Wollaston Theological College.
                        Robert previously taught and researched full-time at the University of Auckland (2015-2016) and
                        Murdoch University (2017-2021).
                    </p>
                    <Button href="https://www.robertjmyles.com/" target="_blank" rel="noreferrer">
                        Robert's website
                    </Button>
                </Col>
                <Col md={{ size: 6, offset: 0 }}>
                    <h3>Grahame Bowland</h3>
                    <h5>Development Lead</h5>
                    <p>
                        Grahame Bowland is a student in the formation programme at Wollaston Theological College.
                        Grahame has a background as software engineer, and is also studying for a Master of Divinity
                        through Trinity College Theological School.
                    </p>
                    <Button href="https://grahame.dev/" target="_blank" rel="noreferrer">
                        Grahame's website
                    </Button>
                </Col>
            </Row>
        </>
    );
};
export const About: React.FC<React.PropsWithChildren<unknown>> = () => {
    return (
        <>
            <Header />
            <Container id="main">
                <Row>
                    <Col md={{ size: 8, offset: 2 }}>
                        <h1>About</h1>
                    </Col>
                </Row>
                <Row>
                    <Col md={{ size: 8, offset: 2 }}>
                        <AboutText />
                    </Col>
                </Row>
                <Row className="sponsors mt-4">
                    <Col md={{ size: 8, offset: 2 }}>
                        <h1>Team</h1>
                        <Bios />
                    </Col>
                </Row>
                <Row className="mt-4">
                    <Col md={{ size: 8, offset: 2 }}>
                        <h1>Sponsors</h1>
                    </Col>
                </Row>
                <Row className="sponsors mt-4">
                    <SponsorLogos />
                </Row>
                <Row className="mt-4">
                    <Col md={{ size: 8, offset: 2 }}>
                        <h1>Texts</h1>
                    </Col>
                </Row>
                <Row className="sponsors mt-4">
                    <Col md={{ size: 8, offset: 2 }}>
                        <Texts />
                    </Col>
                </Row>
            </Container>
            <Footer />
        </>
    );
};
