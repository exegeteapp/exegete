import { Container } from "reactstrap";
import Header from "./Header";

function NotFound() {
    return (
        <>
            <Header />
            <Container id="main">
                <p>Page not found.</p>
            </Container>
        </>
    );
}

export default NotFound;
