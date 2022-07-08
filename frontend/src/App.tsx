import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UserProvider } from "./user/User";
import Home from "./components/Home";
import Register from "./components/Register";
import Verify from "./components/Verify";
import Workspace from "./components/WorkspaceView";
import { Helmet, HelmetProvider } from "react-helmet-async";
import "./App.css";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ModuleInfo from "./components/ModuleInfo";
import NotFound from "./components/NotFound";
import { Privacy } from "./components/Privacy";
import { Disclaimer } from "./components/Disclaimer";
import { About } from "./components/About";
import ScrollToTop from "./components/ScrollToTop";
import { useGetConfigQuery } from "./api/api";

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
                <Route path="/module/:shortcode" element={<ModuleInfo />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgotpassword" element={<ForgotPassword />} />
                <Route path="/verify/:token" element={<Verify />} />
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
