import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const NavMenu = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut();
    navigate("/");
  };
  
  return (
    <nav className="nav-menu">
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/in-need" className="nav-link">Need Help</Link>
      <Link to="/willing-to-help" className="nav-link">Offer Help</Link>
      <Link to="/map-search" className="nav-link">Map Search</Link>
      <Link to="/relief-centers" className="nav-link">Relief Centers</Link>
      <Link to="/profile" className="nav-link">My Profile</Link>
      <Link to="/verification" className="nav-link">Verification</Link>
      <button
        className="nav-link logout-button"
        onClick={handleLogout}
      >
        Logout
      </button>
    </nav>
  );
};

export default NavMenu;