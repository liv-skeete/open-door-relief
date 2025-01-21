import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

function InNeedPage() {
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
  const [contactInfo, setContactInfo] = useState("");

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

  // Fetch pledges from Firestore
  useEffect(() => {
    const fetchPledges = async () => {
      const querySnapshot = await getDocs(collection(db, "pledges"));
      const fetchedPledges = querySnapshot.docs.map((doc) => doc.data());
      setPledges(fetchedPledges);
    };
    fetchPledges();
  }, []);

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
    if (
      !name ||
      !partySize ||
      !location ||
      !emergency ||
      !nightsNeeded ||
      !spaceNeeded ||
      !contactInfo
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "requests"), {
        name,
        partySize: parseInt(partySize),
        location,
        emergency,
        nightsNeeded: parseInt(nightsNeeded),
        typeOfSpace: spaceNeeded,
        needsDisplaced,
        needsEvacuee,
        petFriendly,
        additionalNotes,
        contactInfo,
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
      setContactInfo("");
    } catch (error) {
      console.error("Error submitting request: ", error);
      alert("Something went wrong. Please try again.");
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
        <input
          type="text"
          placeholder="Contact Info (e.g., email@example.com)"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
        />
        <textarea
          placeholder="Additional Notes (optional)"
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
        />
        <button onClick={submitRequest}>Submit Request</button>
      </div>

      <div className="filters">
        <h3>Filter Pledges</h3>
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
          placeholder="Filter by Space Type"
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
            setFilterWillingToHostDisplaced(false);
            setFilterWillingToHostEvacuees(false);
            setFilterPetFriendly(false);
            setFilterNightsOffered("");
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
