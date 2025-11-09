import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import Form from '../Form/Form';
import FormInput from '../Form/FormInput';
import FormButton from '../Form/FormButton';
import ErrorDisplay from '../Form/ErrorDisplay';

const LoginForm = ({ toggleForm, onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check verification status - all users must verify their email
      if (user.emailVerified) {
        // Email is verified
        setEmail(""); // Clear the email field
        setPassword(""); // Clear the password field
        onAuthSuccess(); // Use the callback for successful authentication
      } else {
        // Email is not verified - store user temporarily for resend functionality
        setTempUser(user);
        // Sign out immediately
        await auth.signOut();
        setPassword(""); // Clear the password field only
        setError("Please verify your email before logging in. Check your inbox for a verification link or click below to resend.");
      }
    } catch (err) {
      // Provide user-friendly error messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later or reset your password.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid login credentials. Please check your email and password.");
      } else if (err.code === 'auth/user-disabled') {
        setError("This account has been disabled. Please contact support.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address format.");
      } else {
        setError(`Authentication error: ${err.message}`);
      }
    }
  };
  
  const handleResendVerification = async () => {
    if (!tempUser) {
      setError("Please log in first to resend the verification email.");
      return;
    }
    
    try {
      await sendEmailVerification(tempUser);
      setVerificationSent(true);
      setError(null);
    } catch (err) {
      if (err.code === 'auth/too-many-requests') {
        setError("Too many verification emails sent. Please try again later.");
      } else {
        setError(`Error sending verification email: ${err.message}`);
      }
    }
  };
  
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!resetEmail || !resetEmail.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }
    
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, resetEmail);
      setResetEmailSent(true);
      setError(null);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        // Don't reveal if email exists for security reasons
        setResetEmailSent(true); // Still show success to prevent email enumeration
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many password reset requests. Please try again later.");
      } else {
        setError(`Error sending password reset email: ${err.message}`);
      }
    }
  };
  
  const toggleResetForm = (e) => {
    e.preventDefault();
    setShowResetForm(!showResetForm);
    setResetEmailSent(false);
    setError(null);
  };

  return (
    <div className="form-container">
      <ErrorDisplay error={error} />
      {verificationSent && (
        <p className="verification-sent">
          Verification email sent! Please check your inbox and spam folder.
        </p>
      )}
      {tempUser && !verificationSent && (
        <button
          onClick={handleResendVerification}
          className="resend-verification-button"
        >
          Resend Verification Email
        </button>
      )}
      <Form onSubmit={handleLogin}>
        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <FormInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <FormButton>Login</FormButton>
      </Form>
      <div className="form-links">
        <p>
          Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); toggleForm(); }}>Sign up</a>
        </p>
        <p>
          <a href="#" onClick={toggleResetForm}>Forgot password?</a>
        </p>
      </div>
      
      {showResetForm && (
        <div className="password-reset-form">
          <h3>Reset Password</h3>
          {resetEmailSent ? (
            <div className="reset-email-sent">
              <p>If an account exists with this email, a password reset link has been sent.</p>
              <p>Please check your inbox and follow the instructions to reset your password.</p>
              <button onClick={toggleResetForm} className="back-to-login">Back to Login</button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="reset-buttons">
                <button type="submit" className="form-button">Send Reset Link</button>
                <button type="button" onClick={toggleResetForm} className="cancel-button">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginForm;