import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { UserProvider } from './user/User';
import { ConfigProvider } from './config/Config';
import { IConfigContext, ConfigContext } from './config/Config';
import Home from './components/Home';
import Register from './components/Register';
import Header from './components/Header';
import Verify from './components/Verify';
import './App.css';

function RouterComponent() {
    const { state } = React.useContext<IConfigContext>(ConfigContext);

    if (!state.valid) {
        return <div></div>;
    }

    return <Router>
        <Header />
        <Route path="/" exact component={Home} />
        <Route path="/register" exact component={Register} />
        <Route path="/verify/:token" component={Verify} />
    </Router>
};

function App() {
    return (
        <ConfigProvider>
            <UserProvider>
                <RouterComponent />
            </UserProvider>
        </ConfigProvider>
    );
}


export default App;
