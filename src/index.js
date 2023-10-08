import React from 'react';
// import ReactDOM from 'react-dom';
import App from './App';
import {
  BrowserRouter as Router,
} from "react-router-dom";
import { createRoot } from "react-dom/client";
import 'bootstrap/dist/css/bootstrap.min.css';
<script src="https://apis.google.com/js/api.js"></script>


// ReactDOM.render(
//   <React.StrictMode>
//     <Router>
//       <App />
//     </Router>
//   </React.StrictMode>,
//   document.getElementById('root')
// );

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
     <Router>
       <App />
     </Router>
  </React.StrictMode>,
);