import { Helmet } from "react-helmet-async";
import { Container } from "reactstrap";
import Header from "./Header";

function NotFound() {
    return (
        <>
            <Header />
            <Helmet>
                <title>Page not found - exegete.app</title>
            </Helmet>
            <Container id="main">
                <p>Page not found.</p>
            </Container>
        </>
    );
}

export default NotFound;
