import { Container, Navbar, NavbarBrand } from 'reactstrap';
import { Link } from 'react-router-dom';
import { faBook } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function Header() {
    return (
        <Navbar className="d-print-none" fixed="top" color="dark" dark expand="md">
            <Container>
                <NavbarBrand tag={Link} to="/"><FontAwesomeIcon color="purple" icon={faBook} /> exegete.app</NavbarBrand>
            </Container>
        </Navbar>
    );
}

export default Header;
