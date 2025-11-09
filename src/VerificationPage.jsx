import React, { useState, useEffect } from "react";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import PhoneVerification from "./components/Auth/PhoneVerification";
import BackgroundCheck from "./components/Auth/BackgroundCheck";
import "./App.css";

function VerificationPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState({
    backgroundCheck: false,
    phoneVerification: false,
    emailVerification: false
  });
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const auth = getAuth();

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          
          // Check if user has verification data
          if (data.verification) {
            setVerificationStatus({
              backgroundCheck: data.verification.backgroundChecked || false,
              phoneVerification: data.contactMethods?.phone?.verified || false,
              emailVerification: auth.currentUser.emailVerified || false
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [auth.currentUser]);

  const handleBackgroundCheckComplete = async () => {
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        verification: {
          backgroundChecked: true,
          completionDate: new Date()
        }
      });
      
      setVerificationStatus(prev => ({
        ...prev,
        backgroundCheck: true
      }));
    } catch (error) {
      console.error("Error updating verification status:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading verification status...</div>;
  }

  if (!auth.currentUser) {
    return <div className="error">Please log in to access verification.</div>;
  }

  return (
    <div className="page">
      <h2>Enhanced Verification</h2>
      <p className="subtitle">Increase trust and safety with background verification</p>
      
      <div className="verification-status-panel">
        <h3>Your Verification Status</h3>
        <div className="verification-items">
          <div className={`verification-item ${verificationStatus.emailVerification ? 'verified' : 'unverified'}`}>
            <div className="verification-icon">
              {verificationStatus.emailVerification ? '✓' : '○'}
            </div>
            <div className="verification-details">
              <h4>Email Verification</h4>
              <p>{verificationStatus.emailVerification ? 'Verified' : 'Not Verified'}</p>
            </div>
          </div>

          <div className={`verification-item ${verificationStatus.phoneVerification ? 'verified' : 'unverified'}`}>
            <div className="verification-icon">
              {verificationStatus.phoneVerification ? '✓' : '○'}
            </div>
            <div className="verification-details">
              <h4>Phone Verification</h4>
              <p>{verificationStatus.phoneVerification ? 'Verified' : 'Not Verified'}</p>
            </div>
          </div>

          <div className={`verification-item ${verificationStatus.backgroundCheck ? 'verified' : 'unverified'}`}>
            <div className="verification-icon">
              {verificationStatus.backgroundCheck ? '✓' : '○'}
            </div>
            <div className="verification-details">
              <h4>Background Check</h4>
              <p>{verificationStatus.backgroundCheck ? 'Completed' : 'Not Completed'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {!verificationStatus.emailVerification && (
        <div className="verification-section">
          <h3>Email Verification</h3>
          <p>Verify your email address to increase trust and enable account recovery.</p>
          {emailVerificationSent ? (
            <p className="verification-sent">Verification email sent! Please check your inbox and spam folder.</p>
          ) : (
            <button
              className="resend-verification-button"
              onClick={async () => {
                const auth = getAuth();
                try {
                  await sendEmailVerification(auth.currentUser);
                  setEmailVerificationSent(true);
                } catch (error) {
                  console.error("Error sending verification email:", error);
                  alert(`Error: ${error.message}`);
                }
              }}
            >
              Resend Verification Email
            </button>
          )}
        </div>
      )}

      <div className="verification-section">
        <h3>Phone Verification</h3>
        <p>Verify your phone number to increase trust and enable contact with other users.</p>
        <PhoneVerification />
      </div>

      <div className="verification-section">
        <h3>Background Check</h3>
        <p>
          To ensure the safety of our community, we require a background check
          for all users. This helps us maintain a trusted environment for
          everyone.
        </p>
        <BackgroundCheck onComplete={handleBackgroundCheckComplete} />
      </div>
    </div>
  );
}

export default VerificationPage;