import React from 'react';
import { HashRouter, Route, useHistory } from 'react-router-dom';
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

function Exegete({ match }: { match: any }) {
    return <>
        <Header />
        <Container id="main">
            <p></p>
        </Container>
    </>;
}

function App() {
    return (
        <HashRouter>
            <Route path="/:slug?" render={(props) => <Exegete match={props.match} />} />
        </HashRouter>
    );
}


export default App;
