import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { Container, Navbar, NavbarBrand } from 'reactstrap';
import { Link } from 'react-router-dom';
import { faBook } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './App.css';

function Header() {
    return (
        <Navbar className="d-print-none" fixed="top" color="dark" dark expand="md">
            <Container>
                <NavbarBrand tag={Link} to="/"><FontAwesomeIcon color="purple" icon={faBook} /> exegete.app</NavbarBrand>
            </Container>
        </Navbar>
    );
}

interface MatchParams {
    slug?: string | undefined;
}

function Exegete(props :RouteComponentProps<MatchParams>) {
    return <>
        <Header />
        <Container id="main">
            <p>slug: { props.match.params.slug } </p>
        </Container>
    </>;
}

function App() {
    return (
        <HashRouter>
            <Route path="/:slug?" component={Exegete} />
        </HashRouter>
    );
}


export default App;
