import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

function VerificationPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState({
    idVerification: false,
    backgroundCheck: false,
    addressVerification: false
  });
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    ssn: "",
    dlNumber: "",
    dlState: "",
    consentToCheck: false
  });
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
              idVerification: data.verification.idVerified || false,
              backgroundCheck: data.verification.backgroundChecked || false,
              addressVerification: data.verification.addressVerified || false
            });
            
            // Pre-fill form data if available
            if (data.verification.details) {
              setFormData({
                fullName: data.verification.details.fullName || "",
                dateOfBirth: data.verification.details.dateOfBirth || "",
                address: data.verification.details.address || "",
                city: data.verification.details.city || "",
                state: data.verification.details.state || "",
                zipCode: data.verification.details.zipCode || "",
                ssn: "", // Never pre-fill sensitive information
                dlNumber: "", // Never pre-fill sensitive information
                dlState: data.verification.details.dlState || "",
                consentToCheck: false // Always require new consent
              });
            }
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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step < 3) {
      // Move to next step
      setStep(step + 1);
      return;
    }
    
    // Validate form
    if (!formData.consentToCheck) {
      setError("You must consent to the background check to proceed.");
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      // In a real app, you would send this data to a secure verification service
      // For demo purposes, we'll simulate a successful verification
      
      // Store verification request in Firestore
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        verification: {
          status: "pending",
          requestDate: new Date(),
          details: {
            fullName: formData.fullName,
            dateOfBirth: formData.dateOfBirth,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            dlState: formData.dlState,
            // Note: We don't store sensitive information like SSN or DL number
          }
        }
      });
      
      // For demo purposes, we'll simulate a successful verification after a delay
      setTimeout(async () => {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          verification: {
            status: "completed",
            completionDate: new Date(),
            idVerified: true,
            backgroundChecked: true,
            addressVerified: true,
            details: {
              fullName: formData.fullName,
              dateOfBirth: formData.dateOfBirth,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              dlState: formData.dlState,
            }
          }
        });
        
        // Update local state
        setVerificationStatus({
          idVerification: true,
          backgroundCheck: true,
          addressVerification: true
        });
        
        setSuccess("Verification completed successfully! Your account now has enhanced trust status.");
        setSubmitting(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting verification:", error);
      setError("Failed to submit verification. Please try again.");
      setSubmitting(false);
    }
  };

  // Reset form and start over
  const handleReset = () => {
    setStep(1);
    setFormData({
      fullName: "",
      dateOfBirth: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      ssn: "",
      dlNumber: "",
      dlState: "",
      consentToCheck: false
    });
    setError("");
    setSuccess("");
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
      <p className="subtitle">Increase trust and safety with additional verification</p>
      
      <div className="verification-status-panel">
        <h3>Your Verification Status</h3>
        <div className="verification-items">
          <div className={`verification-item ${verificationStatus.idVerification ? 'verified' : 'unverified'}`}>
            <div className="verification-icon">
              {verificationStatus.idVerification ? '✓' : '○'}
            </div>
            <div className="verification-details">
              <h4>ID Verification</h4>
              <p>{verificationStatus.idVerification ? 'Verified' : 'Not Verified'}</p>
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
          
          <div className={`verification-item ${verificationStatus.addressVerification ? 'verified' : 'unverified'}`}>
            <div className="verification-icon">
              {verificationStatus.addressVerification ? '✓' : '○'}
            </div>
            <div className="verification-details">
              <h4>Address Verification</h4>
              <p>{verificationStatus.addressVerification ? 'Verified' : 'Not Verified'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {verificationStatus.idVerification && 
       verificationStatus.backgroundCheck && 
       verificationStatus.addressVerification ? (
        <div className="verification-complete">
          <h3>Verification Complete</h3>
          <p>
            Your account has been fully verified. This increases trust and safety
            for all users of the platform.
          </p>
          <p>
            Your verified status will be displayed to other users when they view
            your requests or pledges.
          </p>
        </div>
      ) : success ? (
        <div className="verification-success">
          <h3>Verification Submitted</h3>
          <p>{success}</p>
          <p>
            Your verification has been processed and your account now has enhanced
            trust status. This will be visible to other users when they view your
            requests or pledges.
          </p>
        </div>
      ) : (
        <div className="verification-form-container">
          <h3>Complete Verification</h3>
          
          {submitting ? (
            <div className="verification-processing">
              <div className="spinner"></div>
              <p>Processing your verification... This may take a moment.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="verification-form">
              {error && <div className="error-message">{error}</div>}
              
              {step === 1 && (
                <div className="verification-step">
                  <h4>Step 1: Personal Information</h4>
                  
                  <div className="form-group">
                    <label>Full Legal Name:</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Date of Birth:</label>
                    <input 
                      type="date" 
                      name="dateOfBirth" 
                      value={formData.dateOfBirth} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit">Next</button>
                  </div>
                </div>
              )}
              
              {step === 2 && (
                <div className="verification-step">
                  <h4>Step 2: Address Information</h4>
                  
                  <div className="form-group">
                    <label>Street Address:</label>
                    <input 
                      type="text" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>City:</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>State:</label>
                      <input 
                        type="text" 
                        name="state" 
                        value={formData.state} 
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>ZIP Code:</label>
                      <input 
                        type="text" 
                        name="zipCode" 
                        value={formData.zipCode} 
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" onClick={() => setStep(1)}>Back</button>
                    <button type="submit">Next</button>
                  </div>
                </div>
              )}
              
              {step === 3 && (
                <div className="verification-step">
                  <h4>Step 3: Identity Verification</h4>
                  
                  <div className="form-group">
                    <label>Last 4 digits of SSN:</label>
                    <input 
                      type="password" 
                      name="ssn" 
                      value={formData.ssn} 
                      onChange={handleChange}
                      maxLength={4}
                      placeholder="Last 4 digits only"
                      required
                    />
                    <small className="security-note">
                      This information is used only for verification and is not stored.
                    </small>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Driver's License Number:</label>
                      <input 
                        type="text" 
                        name="dlNumber" 
                        value={formData.dlNumber} 
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Issuing State:</label>
                      <input 
                        type="text" 
                        name="dlState" 
                        value={formData.dlState} 
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group checkbox">
                    <label>
                      <input 
                        type="checkbox" 
                        name="consentToCheck" 
                        checked={formData.consentToCheck} 
                        onChange={handleChange}
                        required
                      />
                      I consent to a background check and identity verification. I understand
                      that my information will be handled securely and in accordance with
                      the privacy policy.
                    </label>
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" onClick={() => setStep(2)}>Back</button>
                    <button type="submit">Submit Verification</button>
                  </div>
                </div>
              )}
            </form>
          )}
          
          <div className="verification-info">
            <h4>Why Verify?</h4>
            <p>
              Enhanced verification increases trust and safety for all users. Verified users
              are more likely to be trusted by others during emergency situations.
            </p>
            <p>
              Your information is handled securely and is only used for verification purposes.
              Sensitive information like your SSN and driver's license number are not stored
              after verification is complete.
            </p>
            <p>
              <strong>Note:</strong> For demonstration purposes, this verification process is
              simulated. In a real application, this would connect to identity verification
              and background check services.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerificationPage;