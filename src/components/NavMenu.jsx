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
      <Link to="/profile" className="nav-link">My Profile</Link>
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