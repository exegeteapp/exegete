import "core-js/es/map";
import "core-js/es/set";
import "core-js/es/symbol";
import "core-js/es/promise";
import "core-js/es/symbol/iterator";
import "core-js/es/object/assign";
import "core-js/es/string/replace-all";
import "raf/polyfill";
import { config } from "@fortawesome/fontawesome-svg-core";

import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./exegete/store";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// address CSP issues with react-fontawesome
config.autoAddCss = false;

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
