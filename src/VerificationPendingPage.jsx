import React, { useState } from "react";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { Link } from "react-router-dom";
import "./App.css";

function VerificationPendingPage() {
  const [message, setMessage] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;

  const handleResendVerification = async () => {
    if (!user) {
      setMessage("No user is currently signed in.");
      return;
    }

    try {
      await sendEmailVerification(user);
      setMessage("Verification email sent! Please check your inbox.");
    } catch (error) {
      setMessage(`Error sending verification email: ${error.message}`);
    }
  };

  return (
    <div className="page">
      <div className="verification-pending">
        <h2>Email Verification Required</h2>
        
        <div className="verification-pending-content">
          <p>
            <strong>We've sent a verification email to your inbox.</strong>
          </p>
          
          <p>
            Please verify your email address before continuing. 
            Click the link in the email we sent to {user?.email || "your email address"}.
          </p>
          
          <p>
            After verifying your email, you can <Link to="/auth">log in</Link> to access all features.
          </p>
          
          <div className="verification-actions">
            <button onClick={handleResendVerification} className="resend-button">
              Resend Verification Email
            </button>
            
            <Link to="/auth" className="login-link">
              Return to Login
            </Link>
          </div>
          
          {message && <p className="verification-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default VerificationPendingPage;