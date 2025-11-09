import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { RecaptchaVerifier, PhoneAuthProvider, updatePhoneNumber, linkWithCredential } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";

function PhoneVerification() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter code
  const [loading, setLoading] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

  useEffect(() => {
    // Initialize reCAPTCHA verifier
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'normal',
      'callback': () => {
        // reCAPTCHA solved, allow sending verification code
      },
      'expired-callback': () => {
        // Reset reCAPTCHA
        toast.error("reCAPTCHA expired. Please verify again.");
      }
    });
    
    setRecaptchaVerifier(verifier);
    
    return () => {
      // Clean up reCAPTCHA verifier
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  }, []);

  const sendVerificationCode = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setLoading(true);
    
    try {
      // Format phone number to E.164 format
      const formattedPhoneNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+1${phoneNumber}`; // Assuming US, adjust as needed
      
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        formattedPhoneNumber, 
        recaptchaVerifier
      );
      
      setVerificationId(verificationId);
      setStep(2);
      toast.success("Verification code sent!");
    } catch (error) {
      console.error("Error sending verification code:", error);
      
      // Handle specific "operation-not-allowed" error
      if (error.code === "auth/operation-not-allowed") {
        toast.error(
          <div>
            <p>Phone authentication is not enabled in Firebase project settings.</p>
            <p>Please follow these steps:</p>
            <ol>
              <li>Go to Firebase Console → Authentication → Sign-in method</li>
              <li>Enable Phone authentication</li>
              <li>Save changes and try again</li>
            </ol>
          </div>,
          { autoClose: 10000 }
        );
      } else {
        toast.error(error.message || "Failed to send verification code");
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }
    
    setLoading(true);
    
    try {
      // Create credential with verification ID and code
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      
      // Link phone number to current user
      await linkWithCredential(auth.currentUser, credential);
      
      // Update user document in Firestore
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          "contactMethods.phone.value": phoneNumber,
          "contactMethods.phone.verified": true
        });
      }
      
      toast.success("Phone number verified successfully!");
      
      // Reset form
      setPhoneNumber("");
      setVerificationCode("");
      setStep(1);
    } catch (error) {
      console.error("Error verifying code:", error);
      
      // Handle specific "operation-not-allowed" error
      if (error.code === "auth/operation-not-allowed") {
        toast.error(
          <div>
            <p>Phone authentication is not enabled in Firebase project settings.</p>
            <p>Please follow these steps:</p>
            <ol>
              <li>Go to Firebase Console → Authentication → Sign-in method</li>
              <li>Enable Phone authentication</li>
              <li>Save changes and try again</li>
            </ol>
          </div>,
          { autoClose: 10000 }
        );
      } else {
        toast.error(error.message || "Failed to verify code");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-container">
      <h3>Phone Verification</h3>
      
      {step === 1 ? (
        <form onSubmit={sendVerificationCode}>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(123) 456-7890"
              required
            />
          </div>
          
          <div id="recaptcha-container" className="recaptcha-container"></div>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode}>
          <div className="form-group">
            <label htmlFor="verificationCode">Verification Code</label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="6-digit code"
              maxLength={6}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
          
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setStep(1)}
            disabled={loading}
          >
            Back
          </button>
        </form>
      )}
    </div>
  );
}

export default PhoneVerification;
