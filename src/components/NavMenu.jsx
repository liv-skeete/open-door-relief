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
  
  // Check if user is admin (for demo purposes)
  const isAdmin = auth.currentUser &&
    (auth.currentUser.email.toLowerCase() === 'test@reliefapp.org' ||
     auth.currentUser.email.toLowerCase().endsWith('@opendoorrelief.org'));

  return (
    <nav className="nav-menu">
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/in-need" className="nav-link">Need Help</Link>
      <Link to="/willing-to-help" className="nav-link">Offer Help</Link>
      <Link to="/map-search" className="nav-link">Map Search</Link>
      <Link to="/relief-centers" className="nav-link">Relief Centers</Link>
      <Link to="/profile" className="nav-link">My Profile</Link>
      <Link to="/verification" className="nav-link">Verification</Link>
      <Link to="/donate" className="nav-link donate-link">Donate</Link>
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