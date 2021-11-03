import React from 'react';
import { Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink, Nav, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import { faBook } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IUserContext, UserContext, Logout } from "../user/User";


function UserMenu() {
    const { dispatch, state } = React.useContext<IUserContext>(UserContext);

    if (!state.valid || !state.user) {
        return <div></div>;
    }


    const handleLogout = () => {
        const doLogout = async () => {
            await Logout(dispatch);
        };
        doLogout();
    };

    return <UncontrolledDropdown
        inNavbar
        nav
        className="me-auto"
    >
        <DropdownToggle
            caret
            nav
        >{state.user?.email}</DropdownToggle>
        <DropdownMenu right>
            <DropdownItem onClick={handleLogout}>
                Logout
            </DropdownItem>
        </DropdownMenu>
    </UncontrolledDropdown>;
}


function Header() {

    return (
        <Navbar
            color="dark"
            expand="md"
            fixed="top"
            dark
        >
            <NavbarBrand tag={Link} to="/">
                <FontAwesomeIcon color="purple" icon={faBook} /> exegete.app
            </NavbarBrand>
            <NavbarToggler onClick={function noRefCheck() { }} />
            <Collapse navbar>
                <Nav
                    navbar
                >
                    <NavItem>
                        <NavLink tag={Link} to="/">
                            Home
                        </NavLink>
                    </NavItem>
                </Nav>
            </Collapse>
            <Nav
                navbar
            >
                <UserMenu></UserMenu>
            </Nav>
        </Navbar>
    );
}

export default Header;
