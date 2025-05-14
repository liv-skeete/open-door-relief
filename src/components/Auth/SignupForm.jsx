import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

const SignupForm = ({ toggleForm, onAuthSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Special handling for test account
      const isTestAccount = email.toLowerCase() === 'test@reliefapp.org';
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        emailVerified: isTestAccount, // Auto-verify test account
        createdAt: serverTimestamp()
      });
      
      // Send verification email for non-test accounts
      if (!isTestAccount) {
        await sendEmailVerification(user);
        // Redirect to verification pending page instead of showing error
        navigate("/verification-pending");
      } else {
        // Test account is auto-verified
        onAuthSuccess(); // Proceed with authentication
      }
      
      setEmail(""); // Clear the email field
      setPassword(""); // Clear the password field
      setConfirmPassword(""); // Clear the confirm password field
    } catch (err) {
      // Provide user-friendly error messages
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please use a different email or try logging in instead.");
      } else if (err.code === 'auth/weak-password') {
        setError("Please use a stronger password (at least 6 characters).");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="form-container">
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
        </div>
        <button type="submit" className="form-button">
          Sign Up
        </button>
      </form>
      <p>
        Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); toggleForm(); }}>Login</a>
      </p>
    </div>
  );
};

export default SignupForm;