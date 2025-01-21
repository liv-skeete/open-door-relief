import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import InNeedPage from "./InNeedPage";
import WillingToHelpPage from "./WillingToHelpPage";
import "./App.css";
import logo from "./assets/logo.png"; // Import the logo

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <h1>Open Door Relief</h1>
          <p className="subtitle">Connecting communities during disasters</p>
        </header>
        <Routes>
          {/* Home Screen */}
          <Route
            path="/"
            element={
              <div className="home-screen">
                {/* Logo */}
                <img src={logo} alt="Open Door Relief Logo" className="logo" />
                <div className="home-buttons">
                  <Link to="/in-need" className="home-button">
                    I am in Need
                  </Link>
                  <Link to="/willing-to-help" className="home-button">
                    I am Willing to Help
                  </Link>
                </div>
              </div>
            }
          />
          {/* In Need Page */}
          <Route path="/in-need" element={<InNeedPage />} />
          {/* Willing to Help Page */}
          <Route path="/willing-to-help" element={<WillingToHelpPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;