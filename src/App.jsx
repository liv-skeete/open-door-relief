import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import InNeedPage from "./InNeedPage";
import WillingToHelpPage from "./WillingToHelpPage";
import AuthSwitch from "./components/Auth/AuthSwitch";
import "./App.css";
import logo from "./assets/logo.png";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app">
        <header className="header">
          <h1>Open Door Relief</h1>
          <p className="subtitle">Connecting communities during disasters</p>
        </header>
        <Routes>
          {/* Main landing page */}
          <Route
            path="/"
            element={
              <div className="home-screen">
                <img src={logo} alt="Open Door Relief Logo" className="logo" />
                <div className="home-buttons">
                  <Link
                    to={isLoggedIn ? "/in-need" : "/auth?redirect=/in-need"}
                    className="home-button"
                  >
                    I am in Need
                  </Link>
                  <Link
                    to={isLoggedIn ? "/willing-to-help" : "/auth?redirect=/willing-to-help"}
                    className="home-button"
                  >
                    I am Willing to Help
                  </Link>
                </div>
              </div>
            }
          />

          {/* Redirect /home to / */}
          <Route path="/home" element={<Navigate to="/" />} />

          {/* In Need Page */}
          <Route
            path="/in-need"
            element={isLoggedIn ? <InNeedPage /> : <Navigate to="/auth?redirect=/in-need" />}
          />

          {/* Willing to Help Page */}
          <Route
            path="/willing-to-help"
            element={isLoggedIn ? <WillingToHelpPage /> : <Navigate to="/auth?redirect=/willing-to-help" />}
          />

          {/* Authentication Page */}
          <Route path="/auth" element={<AuthSwitch />} />

          {/* Catch-all route for invalid URLs */}
          <Route
            path="*"
            element={
              <div className="not-found">
                <h1>404 - Page Not Found</h1>
                <p>
                  Sorry, the page you are looking for does not exist.{" "}
                  <Link to="/" className="link-home">
                    Go back to the home page
                  </Link>
                  .
                </p>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;