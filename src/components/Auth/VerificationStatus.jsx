import React, { useState, useEffect } from "react";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const VerificationStatus = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const auth = getAuth();

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Refresh the user to get the latest emailVerified status
        await auth.currentUser.reload();
        
        // Check if the user is the test account
        const isTestAccount = auth.currentUser.email.toLowerCase() === 'test@reliefapp.org';
        
        if (isTestAccount) {
          setIsVerified(true);
          setLoading(false);
          return;
        }
        
        // Check Firebase Auth verification status
        if (auth.currentUser.emailVerified) {
          setIsVerified(true);
          
          // Update Firestore user document
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists() && !userDoc.data().emailVerified) {
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
              emailVerified: true
            });
          }
        } else {
          // Check Firestore verification status as backup
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists() && userDoc.data().emailVerified) {
            setIsVerified(true);
          }
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      }
      
      setLoading(false);
    };

    checkVerificationStatus();
  }, [auth.currentUser]);

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage("Verification email sent! Please check your inbox.");
    } catch (error) {
      setMessage(`Error sending verification email: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Checking verification status...</div>;
  }

  if (!auth.currentUser) {
    return <div>Please log in to see verification status.</div>;
  }

  return (
    <div className="verification-status">
      {isVerified ? (
        <div className="verified">
          <p>✅ Your email has been verified!</p>
        </div>
      ) : (
        <div className="not-verified">
          <p>⚠️ Your email is not verified. Please check your inbox for a verification link.</p>
          <button onClick={handleResendVerification}>Resend Verification Email</button>
          {message && <p className="message">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default VerificationStatus;