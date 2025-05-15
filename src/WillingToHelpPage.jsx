import React, { useState, useEffect } from "react";
import { collection, addDoc, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";
import { isContentAppropriate, sanitizeContent } from "./utils/contentModeration";
import "./App.css";

function WillingToHelpPage() {
  // State for pledges
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [spaceType, setSpaceType] = useState("");
  const [maxPartySize, setMaxPartySize] = useState("");
  const [description, setDescription] = useState("");
  const [nightsOffered, setNightsOffered] = useState("");
  const [willingToHostDisplaced, setWillingToHostDisplaced] = useState(false);
  const [willingToHostEvacuees, setWillingToHostEvacuees] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  
  // User profile and contact methods
  const [userProfile, setUserProfile] = useState(null);
  const [contactMethods, setContactMethods] = useState({});
  const [selectedContactMethods, setSelectedContactMethods] = useState({});

  // State for filtering and displaying requests
  const [requests, setRequests] = useState([]);
  const [filterLocation, setFilterLocation] = useState("");
  const [filterEmergency, setFilterEmergency] = useState("");
  const [filterPartySize, setFilterPartySize] = useState("");
  const [filterTypeOfSpace, setFilterTypeOfSpace] = useState("");
  const [filterWillingToHostDisplaced, setFilterWillingToHostDisplaced] =
    useState(false);
  const [filterWillingToHostEvacuees, setFilterWillingToHostEvacuees] =
    useState(false);
  const [filterNoPets, setFilterNoPets] = useState(false);

  // Fetch user profile and contact methods
  useEffect(() => {
    const fetchUserProfile = async () => {
      const auth = getAuth();
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
          
          if (userData.contactMethods) {
            setContactMethods(userData.contactMethods);
            
            // Initialize selected contact methods (default to all shared methods)
            const initialSelected = {};
            Object.entries(userData.contactMethods).forEach(([method, details]) => {
              if (details.share && details.value) {
                initialSelected[method] = true;
              }
            });
            setSelectedContactMethods(initialSelected);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  // Fetch requests from Firestore with realtime updates
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const q = query(collection(db, "requests"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedRequests = querySnapshot.docs.map((doc) => ({
            id: doc.id, // Include document ID for reference
            ...doc.data()
          }));
          setRequests(fetchedRequests);
        });
        return () => unsubscribe(); // Cleanup on unmount
      } catch (error) {
        console.error("Error fetching requests: ", error);
        alert("Error loading requests. Please check your connection and permissions.");
      }
    };
    fetchRequests();
  }, []);

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const matchesLocation = request.location
      ?.toLowerCase()
      .includes(filterLocation.toLowerCase());
    const matchesEmergency = filterEmergency
      ? request.emergency?.toLowerCase().includes(filterEmergency.toLowerCase())
      : true;
    const matchesPartySize = filterPartySize
      ? request.partySize <= parseInt(filterPartySize)
      : true;
    const matchesTypeOfSpace = filterTypeOfSpace
      ? request.typeOfSpace
          ?.toLowerCase()
          .includes(filterTypeOfSpace.toLowerCase())
      : true;
    const matchesWillingToHostDisplaced =
      filterWillingToHostDisplaced === true
        ? request.needsDisplaced === true
        : true;
    const matchesWillingToHostEvacuees =
      filterWillingToHostEvacuees === true
        ? request.needsEvacuee === true
        : true;
    const matchesNoPets =
      filterNoPets === true ? request.petOwner !== true : true;

    return (
      matchesLocation &&
      matchesEmergency &&
      matchesPartySize &&
      matchesTypeOfSpace &&
      matchesWillingToHostDisplaced &&
      matchesWillingToHostEvacuees &&
      matchesNoPets
    );
  });

  // Submit a pledge
  const submitPledge = async () => {
    // Validate all fields
    const validationErrors = [];
    
    if (!name || name.trim().length < 2) {
      validationErrors.push("Please enter a valid name (at least 2 characters)");
    } else if (!isContentAppropriate(name)) {
      validationErrors.push("Please avoid using inappropriate language in the name field");
    }
    
    if (!location || location.trim().length < 3) {
      validationErrors.push("Please enter a valid location (at least 3 characters)");
    } else if (!isContentAppropriate(location)) {
      validationErrors.push("Please avoid using inappropriate language in the location field");
    }
    
    if (!spaceType || spaceType.trim().length < 2) {
      validationErrors.push("Please specify the type of space you're offering");
    } else if (!isContentAppropriate(spaceType)) {
      validationErrors.push("Please avoid using inappropriate language in the space type field");
    }
    
    // Check description for inappropriate content
    if (description && !isContentAppropriate(description)) {
      validationErrors.push("Please avoid using inappropriate language in the description");
    }
    
    // Validate that at least one contact method is selected
    const hasSelectedContact = Object.values(selectedContactMethods).some(selected => selected);
    if (!hasSelectedContact) {
      validationErrors.push("Please select at least one contact method to share");
    }
    
    // Check if user has any shared contact methods
    const hasSharedContacts = Object.entries(contactMethods).some(
      ([method, details]) => details.share && details.value && selectedContactMethods[method]
    );
    
    if (!hasSharedContacts) {
      validationErrors.push("Please add and share at least one contact method in your profile");
    }
    
    // Validate number fields
    if (maxPartySize !== "" && (isNaN(parseInt(maxPartySize)) || parseInt(maxPartySize) <= 0)) {
      validationErrors.push("Party size must be a positive number");
    }
    
    // Check nights offered - can be "any" or a number
    if (!nightsOffered) {
      validationErrors.push("Please specify how many nights you can offer");
    } else if (
      nightsOffered.toLowerCase() !== "any" &&
      (isNaN(parseInt(nightsOffered)) || parseInt(nightsOffered) <= 0)
    ) {
      validationErrors.push("Nights offered must be 'any' or a positive number");
    }
    
    // Show validation errors if any
    if (validationErrors.length > 0) {
      alert("Please fix the following issues:\n• " + validationErrors.join("\n• "));
      return;
    }

    // Check if user is authenticated
    const auth = getAuth();
    if (!auth.currentUser) {
      alert("You must be logged in to submit a pledge.");
      return;
    }

    try {
      // Get selected contact methods to share
      const sharedContactInfo = {};
      Object.entries(contactMethods).forEach(([method, details]) => {
        if (details.share && details.value && selectedContactMethods[method]) {
          sharedContactInfo[method] = {
            value: details.value,
            verified: details.verified
          };
        }
      });
      
      // Sanitize text content before submission
      const sanitizedName = sanitizeContent(name);
      const sanitizedLocation = sanitizeContent(location);
      const sanitizedSpaceType = sanitizeContent(spaceType);
      const sanitizedDescription = sanitizeContent(description);
      
      await addDoc(collection(db, "pledges"), {
        name: sanitizedName,
        location: sanitizedLocation,
        spaceType: sanitizedSpaceType,
        maxPartySize: maxPartySize === "" ? "Any" : parseInt(maxPartySize),
        contactInfo: auth.currentUser.email, // Primary contact (always email)
        contactMethods: sharedContactInfo, // All selected contact methods
        description: sanitizedDescription,
        nightsOffered:
          nightsOffered.toLowerCase() === "any" ? "Any" : parseInt(nightsOffered),
        willingToHostDisplaced,
        willingToHostEvacuees,
        petFriendly,
        userId: auth.currentUser.uid, // Link to user account
        createdAt: new Date(), // Add timestamp
      });
      alert(
        "Thank you for your kindness! Your pledge has been submitted successfully.",
      );
      setName("");
      setLocation("");
      setSpaceType("");
      setMaxPartySize("");
      // Reset selected contact methods
      const initialSelected = {};
      Object.entries(contactMethods).forEach(([method, details]) => {
        if (details.share && details.value) {
          initialSelected[method] = true;
        }
      });
      setSelectedContactMethods(initialSelected);
      setDescription("");
      setNightsOffered("");
      setWillingToHostDisplaced(false);
      setWillingToHostEvacuees(false);
      setPetFriendly(false);
    } catch (error) {
      console.error("Error submitting pledge: ", error);
      // More detailed error message
      alert(`Error submitting pledge: ${error.code || ''} - ${error.message || 'Unknown error'}. Please check your connection and permissions.`);
    }
  };

  return (
    <div className="page">
      <h2>Offer Help</h2>
      <div className="form">
        <h3>Submit Pledge</h3>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location (e.g., Los Angeles, CA)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="text"
          placeholder="Space Type (e.g., Bedroom, Garage)"
          value={spaceType}
          onChange={(e) => setSpaceType(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Party Size (e.g., 4)"
          value={maxPartySize}
          onChange={(e) => setMaxPartySize(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nights Offered (e.g., 7 or 'any')"
          value={nightsOffered}
          onChange={(e) => setNightsOffered(e.target.value)}
        />
        <div className="checkboxes">
          <label className="styled-checkbox">
            <input
              type="checkbox"
              checked={willingToHostDisplaced}
              onChange={(e) => setWillingToHostDisplaced(e.target.checked)}
            />
            Willing to host displaced individuals
          </label>
          <label className="styled-checkbox">
            <input
              type="checkbox"
              checked={willingToHostEvacuees}
              onChange={(e) => setWillingToHostEvacuees(e.target.checked)}
            />
            Willing to host evacuees
          </label>
          <label className="styled-checkbox">
            <input
              type="checkbox"
              checked={petFriendly}
              onChange={(e) => setPetFriendly(e.target.checked)}
            />
            Pet Friendly
          </label>
        </div>
        <div className="contact-methods-selection">
          <h4>Contact Methods to Share</h4>
          {Object.entries(contactMethods).map(([method, details]) => (
            details.share && details.value ? (
              <div key={method} className="contact-method-option">
                <label className="styled-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedContactMethods[method] || false}
                    onChange={(e) => setSelectedContactMethods({
                      ...selectedContactMethods,
                      [method]: e.target.checked
                    })}
                  />
                  {method.charAt(0).toUpperCase() + method.slice(1)}: {details.value}
                  {details.verified && <span className="verified-badge"> ✓</span>}
                </label>
              </div>
            ) : null
          ))}
          {Object.entries(contactMethods).filter(([_, details]) => details.share && details.value).length === 0 && (
            <p className="no-contacts-message">
              No contact methods available. Please add contact methods in your profile.
            </p>
          )}
        </div>
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={submitPledge}>Submit Pledge</button>
      </div>

      <div className="filters">
        <h3>Requests for Help</h3>
        <input
          type="text"
          placeholder="Filter by Location"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Emergency"
          value={filterEmergency}
          onChange={(e) => setFilterEmergency(e.target.value)}
        />
        <input
          type="number"
          placeholder="Filter by Party Size"
          value={filterPartySize}
          onChange={(e) => setFilterPartySize(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Type of Space"
          value={filterTypeOfSpace}
          onChange={(e) => setFilterTypeOfSpace(e.target.value)}
        />
        <label className="styled-checkbox">
          <input
            type="checkbox"
            checked={filterWillingToHostDisplaced}
            onChange={(e) => setFilterWillingToHostDisplaced(e.target.checked)}
          />
          Willing to Host Displaced
        </label>
        <label className="styled-checkbox">
          <input
            type="checkbox"
            checked={filterWillingToHostEvacuees}
            onChange={(e) => setFilterWillingToHostEvacuees(e.target.checked)}
          />
          Willing to Host Evacuees
        </label>
        <label className="styled-checkbox">
          <input
            type="checkbox"
            checked={filterNoPets}
            onChange={(e) => setFilterNoPets(e.target.checked)}
          />
          No Pets
        </label>
        <button
          className="clear-filters"
          onClick={() => {
            setFilterLocation("");
            setFilterEmergency("");
            setFilterPartySize("");
            setFilterTypeOfSpace("");
            setFilterWillingToHostDisplaced(false);
            setFilterWillingToHostEvacuees(false);
            setFilterNoPets(false);
          }}
        >
          Clear Filters
        </button>
      </div>

      <div className="requests-list">
        <h3>Available Requests</h3>
        <div className="pledge-list">
          {filteredRequests.map((request, index) => (
            <div key={index} className="pledge-item">
              <h3>Location: {request.location || "Not Specified"}</h3>
              <p>
                <strong>Space Needed:</strong>{" "}
                {request.typeOfSpace || "Not Specified"}
              </p>
              <p>
                <strong>Request From:</strong> {request.name || "Anonymous"}
              </p>
              <p>
                <strong>Party Size:</strong>{" "}
                {request.partySize || "Not Specified"}
              </p>
              <p>
                <strong>Emergency:</strong>{" "}
                {request.emergency || "Not Specified"}
              </p>
              <p>
                <strong>Pet Owner:</strong> {request.petOwner ? "Yes" : "No"}
              </p>
              <p>
                <strong>Contact:</strong>{" "}
                {request.contactInfo || "No contact provided"}
              </p>
              <p>
                <strong>Additional Notes:</strong>{" "}
                {request.additionalNotes || "None provided"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WillingToHelpPage;
