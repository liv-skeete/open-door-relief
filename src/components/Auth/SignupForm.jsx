import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import Form from '../Form/Form';
import FormInput from '../Form/FormInput';
import FormButton from '../Form/FormButton';
import ErrorDisplay from '../Form/ErrorDisplay';

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

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        emailVerified: false, // All users start unverified
        displayName: "",
        createdAt: serverTimestamp()
      });
      
      // Send verification email to all new users
      await sendEmailVerification(user);
      
      // Redirect to verification pending page
      navigate("/verification-pending");
      
      setEmail(""); // Clear the email field
      setPassword(""); // Clear the password field
      setConfirmPassword(""); // Clear the confirm password field
    } catch (err) {
      // Provide user-friendly error messages
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please use a different email or try logging in instead.");
      } else if (err.code === 'auth/weak-password') {
        setError("Please use a stronger password (at least 6 characters with a mix of upper/lowercase, numbers, and symbols).");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Email/password sign up is currently disabled. Please try again later.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many sign-up attempts. Please try again later.");
      } else {
        setError(`Sign-up error: ${err.message}`);
      }
    }
  };

  return (
    <div className="form-container">
      <ErrorDisplay error={error} />
      <Form onSubmit={handleSignup}>
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
        <FormInput
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
        />
        <FormButton>Sign Up</FormButton>
      </Form>
      <p>
        Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); toggleForm(); }}>Login</a>
      </p>
    </div>
  );
};

export default SignupForm;