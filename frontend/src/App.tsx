import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Routes/Home/Home";
import Register from "./components/Routes/Register";
import VerifyEmail from "./components/Routes/VerifyEmail";
import Workspace from "./components/Routes/Workspace/Workspace";
import { Helmet, HelmetProvider } from "react-helmet-async";
import "./App.css";
import ForgotPassword from "./components/Routes/ForgotPassword";
import ResetPassword from "./components/Routes/ResetPassword";
import Module from "./components/Routes/Module";
import NotFound from "./components/Routes/NotFound";
import { Privacy } from "./components/Routes/Privacy";
import { Disclaimer } from "./components/Routes/Disclaimer";
import { About } from "./components/Routes/About";
import ScrollToTop from "./util/ScrollToTop";
import { useGetConfigQuery } from "./api/api";
import { UserProvider } from "./components/UserProvider";

function RouterComponent() {
    const { error, isLoading } = useGetConfigQuery();

    if (error || isLoading) {
        return <div></div>;
    }

    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/workspace/:id" element={<Workspace />} />
                <Route path="/module/:shortcode" element={<Module />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgotpassword" element={<ForgotPassword />} />
                <Route path="/verify/:token" element={<VerifyEmail />} />
                <Route path="/resetpassword/:token" element={<ResetPassword />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <HelmetProvider>
            <Helmet>
                <title>exegete.app</title>
            </Helmet>
            <UserProvider>
                <RouterComponent />
            </UserProvider>
        </HelmetProvider>
    );
}

export default App;
