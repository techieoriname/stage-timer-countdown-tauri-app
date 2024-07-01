import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import ReactDOM from "react-dom/client";
import Main from "./screen/Main.tsx";
import Timer from "./screen/Timer.tsx";

import "./assets/styles/index.css"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/timer" element={<Timer />} />
            </Routes>
        </Router>
    </React.StrictMode>
);
