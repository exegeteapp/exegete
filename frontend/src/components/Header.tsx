import React, { useState } from "react";
import {
    Collapse,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    Nav,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from "reactstrap";
import { Link } from "react-router-dom";
import { faBook, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

    return (
        <UncontrolledDropdown nav>
            <DropdownToggle caret nav>
                <FontAwesomeIcon icon={faUser} />
            </DropdownToggle>
            <DropdownMenu md-end={"true"}>
                <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
            </DropdownMenu>
        </UncontrolledDropdown>
    );
}

export const BaseHeader: React.FC = ({ children }) => {
    const [toggled, setToggled] = useState(false);
    return (
        <Navbar color="dark" expand="md" fixed="top" dark>
            <NavbarBrand tag={Link} to="/">
                <FontAwesomeIcon color="purple" icon={faBook} /> exegete.app
            </NavbarBrand>
            <NavbarToggler onClick={() => setToggled(!toggled)} />
            <Collapse navbar isOpen={toggled}>
                <Nav navbar className="ms-auto">
                    {children}
                    <UserMenu />
                </Nav>
            </Collapse>
        </Navbar>
    );
};

function Header() {
    return <BaseHeader />;
}

export default Header;
