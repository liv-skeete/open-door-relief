import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import VerificationStatus from "./components/Auth/VerificationStatus";
import "./App.css";

function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          // Create a basic user document if it doesn't exist
          setUserData({
            email: auth.currentUser.email,
            emailVerified: auth.currentUser.emailVerified
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      
      setLoading(false);
    };

    fetchUserData();
  }, [auth.currentUser]);

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
      
      <div className="profile-section">
        <h3>Account Information</h3>
        <p><strong>Email:</strong> {auth.currentUser.email}</p>
        
        {/* Future profile fields will go here */}
        <div className="profile-actions">
          <p>More profile features coming soon:</p>
          <ul>
            <li>Profile picture upload</li>
            <li>Contact information management</li>
            <li>Default location settings</li>
            <li>View and manage your requests and pledges</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;