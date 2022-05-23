import React from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { Container, Table } from "reactstrap";
import { IScriptureContext, ScriptureContext } from "../scripture/Scripture";
import { Footer } from "./Footer";
import Header from "./Header";

const ModuleInfo: React.FC = () => {
    const { state: scriptureState } = React.useContext<IScriptureContext>(ScriptureContext);
    const { shortcode } = useParams();

    if (!scriptureState.valid || !scriptureState.catalog || !shortcode) {
        return <></>;
    }

    const module = scriptureState.catalog[shortcode];

    return (
        <>
            <Header />
            <Helmet>
                <title>{shortcode} module - exegete.app</title>
            </Helmet>
            <Container id="main">
                <h1>Module: {shortcode}</h1>
                <Table responsive>
                    <tbody>
                        <tr>
                            <th scope="row" className="align-top">
                                Description
                            </th>
                            <td>{module.description}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="align-top">
                                License
                            </th>
                            <td>
                                <pre className="w-100 module-license">{module.license_text}</pre>
                                <p>
                                    <a href={module.license_url} target="_other">
                                        {module.license_url}
                                    </a>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row" className="align-top">
                                Type
                            </th>
                            <td>{module.type}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="align-top">
                                Language
                            </th>
                            <td>{module.language}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="align-top">
                                URL
                            </th>
                            <td>{module.url}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="align-top">
                                Data loaded
                            </th>
                            <td>{module.date_created}</td>
                        </tr>
                    </tbody>
                </Table>
            </Container>
            <Footer />
        </>
    );
};

export default ModuleInfo;
