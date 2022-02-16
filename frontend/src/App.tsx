import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { UserProvider } from "./user/User";
import { ScriptureProvider } from "./scripture/Scripture";
import { IConfigContext, ConfigContext, ConfigProvider } from "./config/Config";
import Home from "./components/Home";
import Register from "./components/Register";
import Verify from "./components/Verify";
import Workspace from "./components/WorkspaceView";
import "./App.css";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ModuleInfo from "./components/ModuleInfo";
import NotFound from "./components/NotFound";

function RouterComponent() {
    const { state } = React.useContext<IConfigContext>(ConfigContext);

    if (!state.valid) {
        return <div></div>;
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
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
        <ConfigProvider>
            <UserProvider>
                <ScriptureProvider>
                    <RouterComponent />
                </ScriptureProvider>
            </UserProvider>
        </ConfigProvider>
    );
}

export default App;
