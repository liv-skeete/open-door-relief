import React, { useState, useEffect, createContext, useContext } from "react";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import VerificationStatus from "./components/Auth/VerificationStatus";
import { isContentAppropriate, sanitizeContent } from "./utils/contentModeration";
import "./App.css";

// Create a context for profile-related functions and state
const ProfileContext = createContext(null);

function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [userRequests, setUserRequests] = useState([]);
  const [userPledges, setUserPledges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("requests");
  const [editingItem, setEditingItem] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [contactMethods, setContactMethods] = useState({
    email: { value: "", verified: false, share: true },
    phone: { value: "", verified: false, share: false },
    other: { value: "", verified: false, share: false }
  });
  const [verificationInProgress, setVerificationInProgress] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  // Don't initialize recaptchaVerifier as state to avoid rendering issues
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Check if this is the test account
        const isTestAccount = auth.currentUser.email.toLowerCase() === 'test@reliefapp.org';
        
        // Fetch user profile
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          
          // Initialize contact methods from user data or with defaults
          if (data.contactMethods) {
            // For test account, ensure all contact methods are verified
            if (isTestAccount) {
              const verifiedMethods = {};
              Object.entries(data.contactMethods).forEach(([method, details]) => {
                verifiedMethods[method] = {
                  ...details,
                  verified: method === 'email' ? true : details.verified
                };
              });
              setContactMethods(verifiedMethods);
              
              // Update Firestore with verified methods for test account
              await updateDoc(doc(db, "users", auth.currentUser.uid), {
                contactMethods: verifiedMethods
              });
            } else {
              setContactMethods(data.contactMethods);
            }
          } else {
            // Migrate old user data to new format
            const updatedData = {
              ...data,
              contactMethods: {
                email: {
                  value: auth.currentUser.email,
                  verified: isTestAccount || auth.currentUser.emailVerified,
                  share: true
                },
                phone: { value: "", verified: isTestAccount, share: false },
                other: { value: "", verified: isTestAccount, share: false }
              }
            };
            setContactMethods(updatedData.contactMethods);
            await updateDoc(doc(db, "users", auth.currentUser.uid), updatedData);
          }
        } else {
          // Create a basic user document if it doesn't exist
          const newUserData = {
            email: auth.currentUser.email,
            emailVerified: isTestAccount || auth.currentUser.emailVerified,
            contactMethods: {
              email: {
                value: auth.currentUser.email,
                verified: isTestAccount || auth.currentUser.emailVerified,
                share: true
              },
              phone: { value: "", verified: isTestAccount, share: false },
              other: { value: "", verified: isTestAccount, share: false }
            }
          };
          setUserData(newUserData);
          setContactMethods(newUserData.contactMethods);
          
          // Save the new user data to Firestore
          await setDoc(doc(db, "users", auth.currentUser.uid), newUserData);
        }

        // Fetch user's requests
        const requestsQuery = query(
          collection(db, "requests"),
          where("contactInfo", "==", auth.currentUser.email)
        );
        const requestsSnapshot = await getDocs(requestsQuery);
        const requestsList = requestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserRequests(requestsList);

        // Fetch user's pledges
        const pledgesQuery = query(
          collection(db, "pledges"),
          where("contactInfo", "==", auth.currentUser.email)
        );
        const pledgesSnapshot = await getDocs(pledgesQuery);
        const pledgesList = pledgesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserPledges(pledgesList);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      
      setLoading(false);
    };

    fetchUserData();
  }, [auth.currentUser]);

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this request?")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "requests", requestId));
      setUserRequests(userRequests.filter(request => request.id !== requestId));
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("Failed to delete request. Please try again.");
    }
  };

  const handleDeletePledge = async (pledgeId) => {
    if (!window.confirm("Are you sure you want to delete this pledge?")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "pledges", pledgeId));
      setUserPledges(userPledges.filter(pledge => pledge.id !== pledgeId));
    } catch (error) {
      console.error("Error deleting pledge:", error);
      alert("Failed to delete pledge. Please try again.");
    }
  };

  const handleUpdateRequest = async (requestId, updatedData) => {
    try {
      await updateDoc(doc(db, "requests", requestId), updatedData);
      setUserRequests(userRequests.map(request =>
        request.id === requestId ? { ...request, ...updatedData } : request
      ));
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Failed to update request. Please try again.");
    }
  };

  const handleUpdatePledge = async (pledgeId, updatedData) => {
    try {
      await updateDoc(doc(db, "pledges", pledgeId), updatedData);
      setUserPledges(userPledges.map(pledge =>
        pledge.id === pledgeId ? { ...pledge, ...updatedData } : pledge
      ));
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating pledge:", error);
      alert("Failed to update pledge. Please try again.");
    }
  };
  
  // We'll create the recaptcha verifier on demand instead of using useEffect
  const createRecaptchaVerifier = () => {
    try {
      // Clear any existing container
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }
      
      const auth = getAuth();
      // Create a new instance each time
      return new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          alert('Verification session expired. Please try again.');
          setVerificationInProgress(null);
        }
      });
    } catch (error) {
      console.error("Error creating recaptcha verifier:", error);
      return null;
    }
  };

  // Start verification process for a contact method
  const startVerification = async (method) => {
    console.log(`Attempting to verify ${method}:`, contactMethods[method]);
    
    // Get the value and trim it
    const value = contactMethods[method]?.value;
    
    // Debug the value
    console.log(`Value for ${method}: "${value}", type: ${typeof value}`);
    
    // Check if the value is empty, undefined, or just whitespace
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      console.error(`Value for ${method} is empty or invalid`);
      alert(`Please enter a valid ${method} before verifying.`);
      return;
    }
    
    // Additional validation for phone numbers
    if (method === 'phone') {
      // Extract digits only for validation
      const digitsOnly = value.replace(/\D/g, '');
      
      // Check if we have at least 10 digits (standard phone number length)
      if (digitsOnly.length < 10) {
        console.error(`Phone number too short: ${digitsOnly.length} digits`);
        alert(`Please enter a valid phone number with at least 10 digits. Current digits: ${digitsOnly.length}`);
        return;
      }
      
      console.log(`Phone validation passed: ${digitsOnly.length} digits`);
    }
    
    setVerificationInProgress(method);
    
    if (method === 'phone') {
      try {
        // Format phone number to E.164 format
        let phoneNumber = value.replace(/\D/g, ''); // Remove non-digits
        if (!phoneNumber.startsWith('1') && phoneNumber.length === 10) {
          phoneNumber = '1' + phoneNumber; // Add US country code if missing
        }
        phoneNumber = '+' + phoneNumber; // Add + prefix
        
        console.log(`Formatted phone number: ${phoneNumber}`);
        
        const auth = getAuth();
        
        // Create a new recaptcha verifier each time
        const verifier = createRecaptchaVerifier();
        if (!verifier) {
          alert('Unable to initialize verification system. Please try again later.');
          setVerificationInProgress(null);
          return;
        }
        
        // Send verification code via SMS
        const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
        setConfirmationResult(confirmation);
        alert('Verification code sent to your phone. Please enter the code.');
      } catch (error) {
        console.error('Error sending verification code:', error);
        alert(`Error sending verification code: ${error.message}`);
        setVerificationInProgress(null);
      }
    } else if (method !== 'other') {
      // For other methods (except 'other' type), use our simulated verification
      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Verification code for ${method}: ${code}`);
      
      // For demo purposes, we'll just alert it
      alert(`For demo purposes, your verification code is: ${code}`);
    }
  };
  
  // Verify a contact method with the provided code
  const verifyContactMethod = async (method) => {
    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      alert("Please enter a valid 6-digit verification code.");
      return;
    }
    
    try {
      if (method === 'phone') {
        if (!confirmationResult) {
          alert("Verification session expired. Please try again.");
          setVerificationInProgress(null);
          return;
        }
        
        // Verify phone number with Firebase
        await confirmationResult.confirm(verificationCode);
        console.log("Phone verification successful!");
      } else {
        // For other methods, we'll accept any 6-digit code in this demo
        // In a real app, you would validate against what was sent
        console.log(`${method} verification accepted (demo mode)`);
      }
      
      // Update the contact method to be verified
      const updatedMethods = {
        ...contactMethods,
        [method]: {
          ...contactMethods[method],
          verified: true
        }
      };
      
      // Update in Firestore
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        contactMethods: updatedMethods
      });
      
      // Update local state
      setContactMethods(updatedMethods);
      setVerificationInProgress(null);
      setVerificationCode("");
      setConfirmationResult(null);
      
      alert(`Your ${method} has been verified successfully!`);
    } catch (error) {
      console.error(`Error verifying ${method}:`, error);
      if (error.code === 'auth/invalid-verification-code') {
        alert("Invalid verification code. Please check and try again.");
      } else if (error.code === 'auth/code-expired') {
        alert("Verification code has expired. Please request a new code.");
        setVerificationInProgress(null);
      } else {
        alert(`Verification failed: ${error.message}. Please try again.`);
      }
    }
  };
  
  const handleUpdateProfile = async (updatedContactMethods) => {
    try {
      // Check for inappropriate content in contact methods
      const hasInappropriateContent = Object.entries(updatedContactMethods).some(
        ([method, details]) => {
          return details.value && !isContentAppropriate(details.value);
        }
      );
      
      if (hasInappropriateContent) {
        alert("Please avoid using inappropriate language in your contact information.");
        return;
      }
      
      // Sanitize contact method values
      const sanitizedContactMethods = {};
      Object.entries(updatedContactMethods).forEach(([method, details]) => {
        sanitizedContactMethods[method] = {
          ...details,
          value: details.value ? sanitizeContent(details.value) : details.value
        };
      });
      
      // Update user data in Firestore
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        contactMethods: sanitizedContactMethods
      });
      
      // Update local state
      setContactMethods(sanitizedContactMethods);
      setUserData({
        ...userData,
        contactMethods: sanitizedContactMethods
      });
      
      setEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };
  
  // Get the preferred contact method to display
  const getPreferredContactInfo = () => {
    // Find the first shared contact method in preferred order: email, phone, other
    const preferredOrder = ['email', 'phone', 'other'];
    
    for (const method of preferredOrder) {
      const details = contactMethods[method];
      if (details?.share && details?.value) {
        return `${method}: ${details.value}${details.verified ? ' (verified)' : ''}`;
      }
    }
    return "No contact information shared";
  };
  
  // Get all shared contact methods for a request or pledge
  const getSharedContactMethods = () => {
    const shared = {};
    
    // Process in preferred order: email, phone, other
    ['email', 'phone', 'other'].forEach(method => {
      const details = contactMethods[method];
      if (details?.share && details?.value) {
        shared[method] = details.value;
      }
    });
    
    return shared;
  };

  const renderRequestItem = (request) => {
    if (editingItem && editingItem.id === request.id) {
      return (
        <div key={request.id} className="profile-item editing">
          <h4>Edit Request</h4>
          <RequestEditForm
            request={request}
            onSave={(updatedData) => handleUpdateRequest(request.id, updatedData)}
            onCancel={() => setEditingItem(null)}
          />
        </div>
      );
    }
    
    return (
      <div key={request.id} className="profile-item">
        <h4>Request for {request.location}</h4>
        <p><strong>Emergency:</strong> {request.emergency}</p>
        <p><strong>Party Size:</strong> {request.partySize}</p>
        <p><strong>Nights Needed:</strong> {request.nightsNeeded}</p>
        <p><strong>Space Needed:</strong> {request.typeOfSpace}</p>
        <div className="item-actions">
          <button onClick={() => setEditingItem(request)}>Edit</button>
          <button onClick={() => handleDeleteRequest(request.id)}>Delete</button>
        </div>
      </div>
    );
  };

  const renderPledgeItem = (pledge) => {
    if (editingItem && editingItem.id === pledge.id) {
      return (
        <div key={pledge.id} className="profile-item editing">
          <h4>Edit Pledge</h4>
          <PledgeEditForm
            pledge={pledge}
            onSave={(updatedData) => handleUpdatePledge(pledge.id, updatedData)}
            onCancel={() => setEditingItem(null)}
          />
        </div>
      );
    }
    
    return (
      <div key={pledge.id} className="profile-item">
        <h4>Space in {pledge.location}</h4>
        <p><strong>Space Type:</strong> {pledge.spaceType}</p>
        <p><strong>Max Party Size:</strong> {pledge.maxPartySize}</p>
        <p><strong>Nights Offered:</strong> {pledge.nightsOffered}</p>
        <p><strong>Pet Friendly:</strong> {pledge.petFriendly ? "Yes" : "No"}</p>
        <div className="item-actions">
          <button onClick={() => setEditingItem(pledge)}>Edit</button>
          <button onClick={() => handleDeletePledge(pledge.id)}>Delete</button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!auth.currentUser) {
    return <div className="error">Please log in to view your profile.</div>;
  }

  return (
    <div className="page">
      <h2>My Profile</h2>
      
      {/* Email Verification Status */}
      <VerificationStatus />
      
      {/* Invisible reCAPTCHA container for phone verification */}
      <div id="recaptcha-container"></div>
      
      <ProfileContext.Provider value={{
        startVerification,
        verificationInProgress,
        verificationCode,
        setVerificationCode,
        verifyContactMethod,
        confirmationResult
      }}>
        <div className="profile-section">
          <h3>Account Information</h3>
          <p><strong>Email:</strong> {auth.currentUser.email}</p>
          
          {editingProfile ? (
            <ProfileContactForm
              contactMethods={contactMethods}
              onSave={handleUpdateProfile}
              onCancel={() => setEditingProfile(false)}
            />
          ) : (
            <div className="contact-methods">
            <h4>Contact Methods</h4>
            {/* Ensure consistent order: email, phone, other */}
            {['email', 'phone', 'other'].map(method => {
              const details = contactMethods[method];
              return details?.value ? (
                <div key={method} className="contact-method">
                  <p>
                    <strong>{method.charAt(0).toUpperCase() + method.slice(1)}:</strong> {details.value}
                    {details.verified ? (
                      <span className="verified-badge"> ✓ Verified</span>
                    ) : (
                      <span className="unverified-badge"> (Unverified)</span>
                    )}
                    <span className={`share-status ${details.share ? 'shared' : 'private'}`}>
                      {details.share ? ' (Shared)' : ' (Private)'}
                    </span>
                  </p>
                </div>
              ) : null;
            })}
            {Object.entries(contactMethods).some(([method, details]) =>
              details.value && (method !== 'other' && !details.verified)
            ) && (
              <div className="verification-disclaimer">
                <p>⚠️ Unverified contact methods may reduce trust in your requests and pledges.</p>
              </div>
            )}
            
            {contactMethods.other?.value && (
              <div className="verification-disclaimer other-warning">
                <p>⚠️ Note: 'Other' contact methods cannot be verified and will be displayed with a warning to users.</p>
              </div>
            )}
            <button onClick={() => setEditingProfile(true)} className="edit-profile-btn">
              Edit Contact Methods
            </button>
            </div>
          )}
        </div>
      </ProfileContext.Provider>
      
      <div className="profile-tabs">
        <button
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => setActiveTab("requests")}
        >
          My Requests ({userRequests.length})
        </button>
        <button
          className={activeTab === "pledges" ? "active" : ""}
          onClick={() => setActiveTab("pledges")}
        >
          My Pledges ({userPledges.length})
        </button>
      </div>
      
      <div className="profile-content">
        {activeTab === "requests" && (
          <div className="requests-list">
            <h3>My Requests for Help</h3>
            {userRequests.length === 0 ? (
              <p>You haven't made any requests yet.</p>
            ) : (
              userRequests.map(renderRequestItem)
            )}
          </div>
        )}
        
        {activeTab === "pledges" && (
          <div className="pledges-list">
            <h3>My Pledges to Help</h3>
            {userPledges.length === 0 ? (
              <p>You haven't made any pledges yet.</p>
            ) : (
              userPledges.map(renderPledgeItem)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Form component for editing requests
function RequestEditForm({ request, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    location: request.location || "",
    partySize: request.partySize || "",
    emergency: request.emergency || "",
    nightsNeeded: request.nightsNeeded || "",
    typeOfSpace: request.typeOfSpace || "",
    additionalNotes: request.additionalNotes || ""
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = [];
    
    if (!formData.location || formData.location.trim().length < 3) {
      validationErrors.push("Please enter a valid location (at least 3 characters)");
    }
    
    if (!formData.emergency || formData.emergency.trim().length < 3) {
      validationErrors.push("Please specify the emergency type (at least 3 characters)");
    }
    
    if (!formData.typeOfSpace || formData.typeOfSpace.trim().length < 2) {
      validationErrors.push("Please specify the type of space needed");
    }
    
    // Validate number fields
    if (!formData.partySize || isNaN(parseInt(formData.partySize)) || parseInt(formData.partySize) <= 0) {
      validationErrors.push("Please enter a valid party size (must be a positive number)");
    }
    
    if (!formData.nightsNeeded || isNaN(parseInt(formData.nightsNeeded)) || parseInt(formData.nightsNeeded) <= 0) {
      validationErrors.push("Please enter a valid number of nights needed (must be a positive number)");
    }
    
    // Show validation errors if any
    if (validationErrors.length > 0) {
      alert("Please fix the following issues:\n• " + validationErrors.join("\n• "));
      return;
    }
    
    onSave({
      ...formData,
      partySize: parseInt(formData.partySize),
      nightsNeeded: parseInt(formData.nightsNeeded)
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <div className="form-group">
        <label>Location:</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Party Size:</label>
        <input
          type="number"
          name="partySize"
          value={formData.partySize}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Emergency:</label>
        <input
          type="text"
          name="emergency"
          value={formData.emergency}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Nights Needed:</label>
        <input
          type="number"
          name="nightsNeeded"
          value={formData.nightsNeeded}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Space Needed:</label>
        <input
          type="text"
          name="typeOfSpace"
          value={formData.typeOfSpace}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Additional Notes:</label>
        <textarea
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleChange}
        />
      </div>
      <div className="form-actions">
        <button type="submit">Save Changes</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

// Form component for editing pledges
function PledgeEditForm({ pledge, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    location: pledge.location || "",
    spaceType: pledge.spaceType || "",
    maxPartySize: pledge.maxPartySize || "",
    nightsOffered: pledge.nightsOffered || "",
    petFriendly: pledge.petFriendly || false,
    willingToHostDisplaced: pledge.willingToHostDisplaced || false,
    willingToHostEvacuees: pledge.willingToHostEvacuees || false,
    description: pledge.description || ""
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = [];
    
    if (!formData.location || formData.location.trim().length < 3) {
      validationErrors.push("Please enter a valid location (at least 3 characters)");
    }
    
    if (!formData.spaceType || formData.spaceType.trim().length < 2) {
      validationErrors.push("Please specify the type of space you're offering");
    }
    
    // Validate number fields
    if (!formData.maxPartySize || isNaN(parseInt(formData.maxPartySize)) || parseInt(formData.maxPartySize) <= 0) {
      validationErrors.push("Party size must be a positive number");
    }
    
    // Check nights offered - can be "any" or a number
    if (!formData.nightsOffered) {
      validationErrors.push("Please specify how many nights you can offer");
    } else if (
      formData.nightsOffered.toLowerCase() !== "any" &&
      (isNaN(parseInt(formData.nightsOffered)) || parseInt(formData.nightsOffered) <= 0)
    ) {
      validationErrors.push("Nights offered must be 'any' or a positive number");
    }
    
    // Show validation errors if any
    if (validationErrors.length > 0) {
      alert("Please fix the following issues:\n• " + validationErrors.join("\n• "));
      return;
    }
    
    onSave({
      ...formData,
      maxPartySize: parseInt(formData.maxPartySize),
      nightsOffered: formData.nightsOffered.toLowerCase() === "any" ? "Any" : formData.nightsOffered
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <div className="form-group">
        <label>Location:</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Space Type:</label>
        <input
          type="text"
          name="spaceType"
          value={formData.spaceType}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Max Party Size:</label>
        <input
          type="number"
          name="maxPartySize"
          value={formData.maxPartySize}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Nights Offered:</label>
        <input
          type="text"
          name="nightsOffered"
          value={formData.nightsOffered}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            name="petFriendly"
            checked={formData.petFriendly}
            onChange={handleChange}
          />
          Pet Friendly
        </label>
      </div>
      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            name="willingToHostDisplaced"
            checked={formData.willingToHostDisplaced}
            onChange={handleChange}
          />
          Willing to Host Displaced
        </label>
      </div>
      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            name="willingToHostEvacuees"
            checked={formData.willingToHostEvacuees}
            onChange={handleChange}
          />
          Willing to Host Evacuees
        </label>
      </div>
      <div className="form-group">
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      <div className="form-actions">
        <button type="submit">Save Changes</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

// Form component for editing contact methods
function ProfileContactForm({ contactMethods, onSave, onCancel }) {
  // These functions should be passed from the parent component
  const { startVerification, verificationInProgress, verificationCode, setVerificationCode, verifyContactMethod } = useContext(ProfileContext) || {
    startVerification: () => alert("Verification functionality is not available"),
    verificationInProgress: null,
    verificationCode: "",
    setVerificationCode: () => {},
    verifyContactMethod: () => {}
  };
  const [formData, setFormData] = useState({...contactMethods});
  
  const handleChange = (method, field, value) => {
    setFormData({
      ...formData,
      [method]: {
        ...formData[method],
        [field]: field === 'share' ? value : value
      }
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const validationErrors = [];
    
    // Validate email if provided
    if (formData.email.value && (!formData.email.value.includes('@') || !formData.email.value.includes('.'))) {
      validationErrors.push("Please enter a valid email address");
    }
    
    // Validate phone if provided
    if (formData.phone.value) {
      const digitsOnly = formData.phone.value.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        validationErrors.push("Please enter a valid phone number with at least 10 digits");
      }
    }
    
    // Check for inappropriate content in all contact methods
    Object.entries(formData).forEach(([method, details]) => {
      if (details.value && !isContentAppropriate(details.value)) {
        validationErrors.push(`Please avoid using inappropriate language in your ${method} field`);
      }
    });
    
    // Show validation errors if any
    if (validationErrors.length > 0) {
      alert("Please fix the following issues:\n• " + validationErrors.join("\n• "));
      return;
    }
    
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <h4>Edit Contact Methods</h4>
      <p className="form-info">Add contact methods, verify them, and choose which ones to share with others.</p>
      
      {/* Ensure consistent order: email, phone, other */}
      {['email', 'phone', 'other'].map(method => {
        const details = formData[method];
        return details && (
          <div key={method} className="contact-method-edit">
            <div className="form-group">
              <label>{method.charAt(0).toUpperCase() + method.slice(1)}:</label>
              <div className="input-with-button">
                <input
                  type={method === 'email' ? 'email' : method === 'phone' ? 'tel' : 'text'}
                  value={details.value}
                  onChange={(e) => handleChange(method, 'value', e.target.value)}
                  placeholder={method === 'phone' ? "Enter phone (e.g., 123-456-7890)" : `Enter your ${method}`}
                  disabled={method === 'email'} // Email is managed by Firebase Auth
                  pattern={method === 'phone' ? "[0-9\\-\\+\\(\\) ]+" : undefined}
                />
                
                {method !== 'email' && method !== 'other' && details.value && details.value.trim() !== '' && !details.verified && (
                  <button
                    type="button"
                    className="verify-button"
                    onClick={() => {
                      // Ensure the method is passed correctly
                      console.log(`Verifying ${method}: ${details.value}`);
                      startVerification(method);
                    }}
                  >
                    Verify
                  </button>
                )}
              </div>
              {method === 'phone' && (
                <small className="input-hint">Format: Must contain at least 10 digits. Can include +, -, (), and spaces.</small>
              )}
            </div>
            
            {verificationInProgress === method && (
            <div className="verification-code-input">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
              <button
                type="button"
                onClick={() => verifyContactMethod(method)}
              >
                Submit
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setVerificationInProgress(null);
                  setVerificationCode("");
                }}
              >
                Cancel
              </button>
            </div>
          )}
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={details.share}
                onChange={(e) => handleChange(method, 'share', e.target.checked)}
              />
              Share this contact method
            </label>
          </div>
          
          {details.verified ? (
            <div className="verified-status">
              ✓ Verified
            </div>
          ) : details.value && (
            <div className="unverified-status">
              {method === 'other' ?
                "⚠️ Other contact methods cannot be verified - Users will be warned when viewing this information" :
                "⚠️ Unverified - Verification required before sharing"}
            </div>
          )}
        </div>
      );
      })}
      
      <div className="verification-note">
        <p>Note: Email verification is handled through your account settings.</p>
        <p>For phone numbers, click "Verify" to receive a verification code.</p>
        <p>Other contact methods cannot be verified but will be displayed with a warning.</p>
        <p className="warning">Unverified contact methods may reduce trust in your requests and pledges.</p>
      </div>
      
      <div className="form-actions">
        <button type="submit">Save Changes</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default ProfilePage;