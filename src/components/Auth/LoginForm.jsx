import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const LoginForm = ({ toggleForm, onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail(""); // Clear the email field
      setPassword(""); // Clear the password field
      onAuthSuccess(); // Use the callback for successful authentication
    } catch (err) {
      setError(err.message);
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
      <p>
        Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); toggleForm(); }}>Sign up</a>
      </p>
    </div>
  );
};

export default LoginForm;