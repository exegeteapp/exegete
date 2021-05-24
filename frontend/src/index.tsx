import 'core-js/es/map';
import 'core-js/es/set';
import 'core-js/es/symbol';
import 'core-js/es/promise';
import 'core-js/es/symbol/iterator';
import 'core-js/es/object/assign';
import 'core-js/es/string/replace-all';
import 'raf/polyfill'

import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
