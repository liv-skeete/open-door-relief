import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const AuthSwitch = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
  };

  const handleAuthSuccess = () => {
    // Retrieve the redirect path from the query parameters
    const params = new URLSearchParams(location.search);
    const redirectPath = params.get("redirect") || "/";
    navigate(redirectPath);
  };

  return (
    <div className="auth-container">
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      {isLogin ? (
        <LoginForm toggleForm={toggleForm} onAuthSuccess={handleAuthSuccess} />
      ) : (
        <SignupForm toggleForm={toggleForm} onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
};

export default AuthSwitch;