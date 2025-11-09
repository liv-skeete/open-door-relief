import React, { useState, useEffect } from "react";
import { collection, addDoc, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";
import { isContentAppropriate, sanitizeContent } from "./utils/contentModeration";
import { useOfflineSync } from "./components/OfflineSync/OfflineSyncProvider";
import { saveItem, getAllItems, STORES } from "./utils/offlineStorage";
import ContactLinks from "./components/Contact/ContactLinks.jsx";
import "./App.css";

function InNeedPage() {
  // Get offline sync context
  const { isOnline } = useOfflineSync();
  // State for requests
  const [name, setName] = useState("");
  const [partySize, setPartySize] = useState("");
  const [location, setLocation] = useState("");
  const [emergency, setEmergency] = useState("");
  const [nightsNeeded, setNightsNeeded] = useState("");
  const [spaceNeeded, setSpaceNeeded] = useState("");
  const [needsDisplaced, setNeedsDisplaced] = useState(false);
  const [needsEvacuee, setNeedsEvacuee] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  
  // User profile and contact methods
  const [, setUserProfile] = useState(null);
  const [contactMethods, setContactMethods] = useState({});
  const [selectedContactMethods, setSelectedContactMethods] = useState({});

  // State for pledges and filters
  const [pledges, setPledges] = useState([]);
  const [filterLocation, setFilterLocation] = useState("");
  const [filterPartySize, setFilterPartySize] = useState("");
  const [filterSpaceType, setFilterSpaceType] = useState("");
  const [filterWillingToHostDisplaced, setFilterWillingToHostDisplaced] =
    useState(false);
  const [filterWillingToHostEvacuees, setFilterWillingToHostEvacuees] =
    useState(false);
  const [filterPetFriendly, setFilterPetFriendly] = useState(false);
  const [filterNightsOffered, setFilterNightsOffered] = useState("");

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
  
  // Fetch pledges from Firestore with realtime updates or from IndexedDB when offline
  useEffect(() => {
    const fetchPledges = async () => {
      try {
        if (isOnline) {
          // Online: Use Firestore with realtime updates
          const q = query(collection(db, "pledges"));
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedPledges = querySnapshot.docs.map((doc) => ({
              id: doc.id, // Include document ID for reference
              ...doc.data()
            }));
            setPledges(fetchedPledges);
            
            // Save pledges to IndexedDB for offline use
            fetchedPledges.forEach(async (pledge) => {
              await saveItem(STORES.PLEDGES, pledge);
            });
          });
          return () => unsubscribe(); // Cleanup on unmount
        } else {
          // Offline: Use IndexedDB
          const offlinePledges = await getAllItems(STORES.PLEDGES);
          setPledges(offlinePledges);
        }
      } catch (error) {
        console.error("Error fetching pledges: ", error);
        
        // Try to get from IndexedDB as fallback
        try {
          const offlinePledges = await getAllItems(STORES.PLEDGES);
          setPledges(offlinePledges);
        } catch (offlineError) {
          console.error("Error fetching offline pledges: ", offlineError);
          alert("Error loading pledges. Please check your connection and permissions.");
        }
      }
    };
    fetchPledges();
  }, [isOnline]);

  // Filter pledges
  const filteredPledges = pledges.filter((pledge) => {
    const matchesLocation = pledge.location
      ?.toLowerCase()
      .includes(filterLocation.toLowerCase());
    const matchesPartySize = filterPartySize
      ? parseInt(pledge.maxPartySize) >= parseInt(filterPartySize)
      : true;
    const matchesSpaceType = filterSpaceType
      ? pledge.spaceType?.toLowerCase().includes(filterSpaceType.toLowerCase())
      : true;
    const matchesWillingToHostDisplaced =
      filterWillingToHostDisplaced === true
        ? pledge.willingToHostDisplaced === true
        : true;
    const matchesWillingToHostEvacuees =
      filterWillingToHostEvacuees === true
        ? pledge.willingToHostEvacuees === true
        : true;
    const matchesPetFriendly =
      filterPetFriendly === true ? pledge.petFriendly === true : true;
    const matchesNightsOffered = filterNightsOffered
      ? pledge.nightsOffered === "Any" ||
        parseInt(pledge.nightsOffered) >= parseInt(filterNightsOffered)
      : true;

    return (
      matchesLocation &&
      matchesPartySize &&
      matchesSpaceType &&
      matchesWillingToHostDisplaced &&
      matchesWillingToHostEvacuees &&
      matchesPetFriendly &&
      matchesNightsOffered
    );
  });

  // Submit a request for help
  const submitRequest = async () => {
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
    
    if (!emergency || emergency.trim().length < 3) {
      validationErrors.push("Please specify the emergency type (at least 3 characters)");
    } else if (!isContentAppropriate(emergency)) {
      validationErrors.push("Please avoid using inappropriate language in the emergency field");
    }
    
    if (!spaceNeeded || spaceNeeded.trim().length < 2) {
      validationErrors.push("Please specify the type of space needed");
    } else if (!isContentAppropriate(spaceNeeded)) {
      validationErrors.push("Please avoid using inappropriate language in the space needed field");
    }
    
    // Check additional notes for inappropriate content
    if (additionalNotes && !isContentAppropriate(additionalNotes)) {
      validationErrors.push("Please avoid using inappropriate language in the additional notes");
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
    if (!partySize || isNaN(parseInt(partySize)) || parseInt(partySize) <= 0) {
      validationErrors.push("Please enter a valid party size (must be a positive number)");
    }
    
    if (!nightsNeeded || isNaN(parseInt(nightsNeeded)) || parseInt(nightsNeeded) <= 0) {
      validationErrors.push("Please enter a valid number of nights needed (must be a positive number)");
    }
    
    // Show validation errors if any
    if (validationErrors.length > 0) {
      alert("Please fix the following issues:\n• " + validationErrors.join("\n• "));
      return;
    }

    // Check if user is authenticated
    const auth = getAuth();
    if (!auth.currentUser) {
      alert("You must be logged in to submit a request.");
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
      const sanitizedEmergency = sanitizeContent(emergency);
      const sanitizedSpaceNeeded = sanitizeContent(spaceNeeded);
      const sanitizedNotes = sanitizeContent(additionalNotes);
      
      await addDoc(collection(db, "requests"), {
        name: sanitizedName,
        partySize: parseInt(partySize),
        location: sanitizedLocation,
        emergency: sanitizedEmergency,
        nightsNeeded: parseInt(nightsNeeded),
        typeOfSpace: sanitizedSpaceNeeded,
        needsDisplaced,
        needsEvacuee,
        petFriendly,
        additionalNotes: sanitizedNotes,
        contactInfo: auth.currentUser.email, // Primary contact (always email)
        contactMethods: sharedContactInfo, // All selected contact methods
        userId: auth.currentUser.uid, // Link to user account
        createdAt: new Date(), // Add timestamp
      });
      alert(
        "Thank you for reaching out. Your request has been submitted, and we’ll do everything we can to help you find a safe space. Our thoughts are with you during this challenging time.",
      );
      setName("");
      setPartySize("");
      setLocation("");
      setEmergency("");
      setNightsNeeded("");
      setSpaceNeeded("");
      setNeedsDisplaced(false);
      setNeedsEvacuee(false);
      setPetFriendly(false);
      setAdditionalNotes("");
      // Reset selected contact methods
      const initialSelected = {};
      Object.entries(contactMethods).forEach(([method, details]) => {
        if (details.share && details.value) {
          initialSelected[method] = true;
        }
      });
      setSelectedContactMethods(initialSelected);
    } catch (error) {
      console.error("Error submitting request: ", error);
      // More detailed error message
      alert(`Error submitting request: ${error.code || ''} - ${error.message || 'Unknown error'}. Please check your connection and permissions.`);
    }
  };

  return (
    <div className="page">
      <h2>Request Help</h2>
      <div className="form">
        <h3>Submit Request</h3>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Party Size (e.g., 5)"
          value={partySize}
          onChange={(e) => setPartySize(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location (e.g., Los Angeles, CA)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="text"
          placeholder="Emergency (e.g., Hurricane Helene)"
          value={emergency}
          onChange={(e) => setEmergency(e.target.value)}
        />
        <input
          type="number"
          placeholder="Nights Needed (e.g., 3)"
          value={nightsNeeded}
          onChange={(e) => setNightsNeeded(e.target.value)}
        />
        <input
          type="text"
          placeholder="Space Needed (e.g., Bedroom, Garage)"
          value={spaceNeeded}
          onChange={(e) => setSpaceNeeded(e.target.value)}
        />
        <label className="styled-checkbox">
          <input
            type="checkbox"
            checked={needsDisplaced}
            onChange={(e) => setNeedsDisplaced(e.target.checked)}
          />
          Displaced Individual
        </label>
        <label className="styled-checkbox">
          <input
            type="checkbox"
            checked={needsEvacuee}
            onChange={(e) => setNeedsEvacuee(e.target.checked)}
          />
          Evacuee
        </label>
        <label className="styled-checkbox">
          <input
            type="checkbox"
            checked={petFriendly}
            onChange={(e) => setPetFriendly(e.target.checked)}
          />
          Pet Owner
        </label>
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
          {Object.entries(contactMethods).filter(([, details]) => details.share && details.value).length === 0 && (
            <p className="no-contacts-message">
              No contact methods available. Please add contact methods in your profile.
            </p>
          )}
        </div>
        <textarea
          placeholder="Additional Notes (optional)"
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
        />
        <button onClick={submitRequest}>Submit Request</button>
      </div>
      <div className="filters">
        <h3>Available Pledges</h3>
        <input
          type="text"
          placeholder="Filter by Location"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
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
          value={filterSpaceType}
          onChange={(e) => setFilterSpaceType(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Nights Offered"
          value={filterNightsOffered}
          onChange={(e) => setFilterNightsOffered(e.target.value)}
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
            checked={filterPetFriendly}
            onChange={(e) => setFilterPetFriendly(e.target.checked)}
          />
          Pet Friendly
        </label>
        <button
          className="clear-filters"
          onClick={() => {
            setFilterLocation("");
            setFilterPartySize("");
            setFilterSpaceType("");
            setFilterNightsOffered("");
            setFilterWillingToHostDisplaced(false);
            setFilterWillingToHostEvacuees(false);
            setFilterPetFriendly(false);
          }}
        >
          Clear Filters
        </button>
      </div>

      <div className="pledges-list">
        <h3>Available Pledges</h3>
        <div className="pledge-list">
          {filteredPledges.map((pledge, index) => (
            <div key={index} className="pledge-item">
              <h3>Location: {pledge.location || "Not Specified"}</h3>
              <p>
                <strong>Space Type:</strong>{" "}
                {pledge.spaceType || "Not Specified"}
              </p>
              <p>
                <strong>Max Party Size:</strong>{" "}
                {pledge.maxPartySize || "Not Specified"}
              </p>
              <p>
                <strong>Nights Offered:</strong>{" "}
                {pledge.nightsOffered || "Not Specified"}
              </p>
              <p>
                <strong>Willing to Host Displaced:</strong>{" "}
                {pledge.willingToHostDisplaced ? "Yes" : "No"}
              </p>
              <p>
                <strong>Willing to Host Evacuees:</strong>{" "}
                {pledge.willingToHostEvacuees ? "Yes" : "No"}
              </p>
              <p>
                <strong>Pet Friendly:</strong>{" "}
                {pledge.petFriendly ? "Yes" : "No"}
              </p>
              <p>
                <strong>Contact:</strong>{" "}
                {pledge.contactInfo || "No contact provided"}
              </p>
              <ContactLinks contactInfo={pledge.contactMethods} />
              <p>
                <strong>Description:</strong>{" "}
                {pledge.description || "No description provided"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InNeedPage;



