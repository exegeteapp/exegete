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
import { Link, useNavigate } from "react-router-dom";
import { faBookOpen, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Logout, selectUser } from "../user/User";
import { useAppDispatch, useAppSelector } from "../exegete/hooks";

function UserMenu() {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selectUser);
    const navigate = useNavigate();

    if (!state.valid || !state.user) {
        return <div></div>;
    }

    const handleLogout = () => {
        const doLogout = async () => {
            await dispatch(Logout());
            navigate("/");
        };
        doLogout();
    };

    return (
        <UncontrolledDropdown nav>
            <DropdownToggle caret nav>
                <FontAwesomeIcon icon={faUser} />
            </DropdownToggle>
            <DropdownMenu md-end={"true"} color="dark" dark>
                <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
            </DropdownMenu>
        </UncontrolledDropdown>
    );
}

export const BaseHeader: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    const [toggled, setToggled] = useState(false);
    return (
        <Navbar color="dark" expand="md" fixed="top" dark>
            <NavbarBrand tag={Link} to="/">
                <FontAwesomeIcon color="white" icon={faBookOpen} /> exegete.app
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
