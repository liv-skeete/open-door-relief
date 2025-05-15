import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import InNeedPage from "./InNeedPage";
import WillingToHelpPage from "./WillingToHelpPage";
import ProfilePage from "./ProfilePage";
import VerificationPendingPage from "./VerificationPendingPage";
import MapSearchPage from "./MapSearchPage";
import ReliefCentersPage from "./ReliefCentersPage";
import VerificationPage from "./VerificationPage";
import AuthSwitch from "./components/Auth/AuthSwitch";
import NavMenu from "./components/NavMenu";
import "./App.css";
import logo from "./assets/logo.png";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if test account or verified
        const isTestAccount = user.email.toLowerCase() === 'test@reliefapp.org';
        
        if (isTestAccount || user.emailVerified) {
          setIsLoggedIn(true);
          setIsVerified(true);
        } else {
          // User is logged in but not verified
          setIsLoggedIn(true);
          setIsVerified(false);
        }
      } else {
        // No user is logged in
        setIsLoggedIn(false);
        setIsVerified(false);
      }
    });

    return () => unsubscribe();
  }, []);
  
  // Helper function to check if user can access protected routes
  const canAccessProtectedRoutes = isLoggedIn && isVerified;

  return (
    <Router>
      <div className="app">
        <header className="header">
          <h1>Open Door Relief</h1>
          <p className="subtitle">Connecting communities during disasters</p>
          {canAccessProtectedRoutes && <NavMenu />}
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
                    to={
                      canAccessProtectedRoutes
                        ? "/in-need"
                        : isLoggedIn
                          ? "/verification-pending"
                          : "/auth?redirect=/in-need"
                    }
                    className="home-button"
                  >
                    I am in Need
                  </Link>
                  <Link
                    to={
                      canAccessProtectedRoutes
                        ? "/willing-to-help"
                        : isLoggedIn
                          ? "/verification-pending"
                          : "/auth?redirect=/willing-to-help"
                    }
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
            element={
              canAccessProtectedRoutes ? (
                <InNeedPage />
              ) : isLoggedIn ? (
                <Navigate to="/verification-pending" />
              ) : (
                <Navigate to="/auth?redirect=/in-need" />
              )
            }
          />

          {/* Willing to Help Page */}
          <Route
            path="/willing-to-help"
            element={
              canAccessProtectedRoutes ? (
                <WillingToHelpPage />
              ) : isLoggedIn ? (
                <Navigate to="/verification-pending" />
              ) : (
                <Navigate to="/auth?redirect=/willing-to-help" />
              )
            }
          />

          {/* Profile Page */}
          <Route
            path="/profile"
            element={
              canAccessProtectedRoutes ? (
                <ProfilePage />
              ) : isLoggedIn ? (
                <Navigate to="/verification-pending" />
              ) : (
                <Navigate to="/auth?redirect=/profile" />
              )
            }
          />

          {/* Map Search Page */}
          <Route
            path="/map-search"
            element={
              canAccessProtectedRoutes ? (
                <MapSearchPage />
              ) : isLoggedIn ? (
                <Navigate to="/verification-pending" />
              ) : (
                <Navigate to="/auth?redirect=/map-search" />
              )
            }
          />

          {/* Relief Centers Page */}
          <Route
            path="/relief-centers"
            element={
              canAccessProtectedRoutes ? (
                <ReliefCentersPage />
              ) : isLoggedIn ? (
                <Navigate to="/verification-pending" />
              ) : (
                <Navigate to="/auth?redirect=/relief-centers" />
              )
            }
          />

          {/* Enhanced Verification Page */}
          <Route
            path="/verification"
            element={
              canAccessProtectedRoutes ? (
                <VerificationPage />
              ) : isLoggedIn ? (
                <Navigate to="/verification-pending" />
              ) : (
                <Navigate to="/auth?redirect=/verification" />
              )
            }
          />

          {/* Verification Pending Page */}
          <Route path="/verification-pending" element={<VerificationPendingPage />} />

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