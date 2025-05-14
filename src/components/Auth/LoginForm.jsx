import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const LoginForm = ({ toggleForm, onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Special handling for test account
      const isTestAccount = email.toLowerCase() === 'test@reliefapp.org';
      
      if (isTestAccount) {
        // Test account bypasses verification
        setEmail(""); // Clear the email field
        setPassword(""); // Clear the password field
        onAuthSuccess(); // Use the callback for successful authentication
        return;
      }
      
      // For regular accounts, check verification status
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (user.emailVerified || (userDoc.exists() && userDoc.data().emailVerified)) {
        // Email is verified
        setEmail(""); // Clear the email field
        setPassword(""); // Clear the password field
        onAuthSuccess(); // Use the callback for successful authentication
      } else {
        // Email is not verified - sign out immediately
        await auth.signOut();
        setEmail(""); // Clear the email field
        setPassword(""); // Clear the password field
        setError("Please verify your email before logging in. Check your inbox for a verification link.");
      }
    } catch (err) {
      // Provide user-friendly error messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later or reset your password.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid login credentials. Please check your email and password.");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="form-container">
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
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
        <button type="submit" className="form-button">
          Login
        </button>
      </form>
      {import.meta.env.DEV && (
        <div className="test-credentials-banner">
          <button
            onClick={() => {
              setEmail('test@reliefapp.org');
              setPassword('test1234');
            }}
            className="test-button"
          >
            Load Test Credentials
          </button>
          <p className="test-warning">Development mode active</p>
        </div>
      )}
      <p>
        Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); toggleForm(); }}>Sign up</a>
      </p>
    </div>
  );
};

export default LoginForm;