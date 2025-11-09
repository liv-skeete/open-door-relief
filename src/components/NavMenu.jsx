import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const NavMenu = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  
  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };
  
  // Check if user is admin (only @opendoorrelief.org emails)
  const isAdmin = auth.currentUser &&
     auth.currentUser.email.toLowerCase().endsWith('@opendoorrelief.org');

  return (
    <nav className="nav-menu">
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/in-need" className="nav-link">Need Help</Link>
      <Link to="/willing-to-help" className="nav-link">Offer Help</Link>
      <Link to="/profile" className="nav-link">My Profile</Link>
      <Link to="/verification" className="nav-link">Verification</Link>
      {isAdmin && (
        <Link to="/admin" className="nav-link admin-link">Admin</Link>
      )}
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