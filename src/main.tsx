import React, { useEffect } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ReactDOM from "react-dom/client";
import Main from "./screen/Main.tsx";
import Timer from "./screen/Timer.tsx";

import "./assets/styles/index.css";
import "react-toastify/dist/ReactToastify.css";
import 'tippy.js/dist/tippy.css';

const App = () => {
    useEffect(() => {
        // Disable right-click context menu on the entire document
        const handleContextMenu = (event: Event) => {
            event.preventDefault();
        };

        document.addEventListener("contextmenu", handleContextMenu);

        // Clean up event listener when the component unmounts
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    }, []);

    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/timer" element={<Timer />} />
                </Routes>
            </Router>
            <ToastContainer theme="dark" />
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

