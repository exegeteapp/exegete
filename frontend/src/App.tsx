import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './user/User';
import { ScriptureProvider } from './scripture/Scripture';
import { IConfigContext, ConfigContext, ConfigProvider } from './config/Config';
import Home from './components/Home';
import Register from './components/Register';
import Header from './components/Header';
import Verify from './components/Verify';
import './App.css';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function RouterComponent() {
    const { state } = React.useContext<IConfigContext>(ConfigContext);

    if (!state.valid) {
        return <div></div>;
    }

    return <Router>
        <Header />
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/forgotpassword" element={<ForgotPassword/>} />
            <Route path="/verify/:token" element={<Verify/>} />
            <Route path="/resetpassword/:token" element={<ResetPassword/>} />
        </Routes>
    </Router>
};

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
