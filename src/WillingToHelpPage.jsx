import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

function WillingToHelpPage() {
  // State for pledges
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [spaceType, setSpaceType] = useState("");
  const [maxPartySize, setMaxPartySize] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [description, setDescription] = useState("");
  const [nightsOffered, setNightsOffered] = useState("");
  const [willingToHostDisplaced, setWillingToHostDisplaced] = useState(false);
  const [willingToHostEvacuees, setWillingToHostEvacuees] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);

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

  // Fetch requests from Firestore
  useEffect(() => {
    const fetchRequests = async () => {
      const querySnapshot = await getDocs(collection(db, "requests"));
      const fetchedRequests = querySnapshot.docs.map((doc) => doc.data());
      setRequests(fetchedRequests);
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
    if (!name || !location || !spaceType || !contactInfo || !nightsOffered) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "pledges"), {
        name,
        location,
        spaceType,
        maxPartySize: maxPartySize === "" ? "Any" : parseInt(maxPartySize),
        contactInfo,
        description,
        nightsOffered:
          nightsOffered === "any" ? "Any" : parseInt(nightsOffered),
        willingToHostDisplaced,
        willingToHostEvacuees,
        petFriendly,
      });
      alert(
        "Thank you for your kindness! Your pledge has been submitted successfully.",
      );
      setName("");
      setLocation("");
      setSpaceType("");
      setMaxPartySize("");
      setContactInfo("");
      setDescription("");
      setNightsOffered("");
      setWillingToHostDisplaced(false);
      setWillingToHostEvacuees(false);
      setPetFriendly(false);
    } catch (error) {
      console.error("Error submitting pledge: ", error);
      alert("Something went wrong. Please try again.");
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
        <input
          type="text"
          placeholder="Contact Info (e.g., email@example.com or 555-555-5555)"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
        />
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
