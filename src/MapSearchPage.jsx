import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

function MapSearchPage() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [filterType, setFilterType] = useState("all"); // all, requests, pledges
  const [filterEmergency, setFilterEmergency] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // Load Google Maps API
  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Load Google Maps API script
    const googleMapsScript = document.createElement("script");
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;
    googleMapsScript.onload = initializeMap;
    document.head.appendChild(googleMapsScript);

    return () => {
      // Clean up script if component unmounts before script loads
      document.head.removeChild(googleMapsScript);
    };
  }, []);

  // Initialize map once API is loaded
  const initializeMap = () => {
    const mapInstance = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
      zoom: 10,
    });

    setMap(mapInstance);
    setMapLoaded(true);
  };

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch requests
        const requestsSnapshot = await getDocs(collection(db, "requests"));
        const requestsData = requestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: "request"
        }));
        setRequests(requestsData);

        // Fetch pledges
        const pledgesSnapshot = await getDocs(collection(db, "pledges"));
        const pledgesData = pledgesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: "pledge"
        }));
        setPledges(pledgesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Update markers when map is loaded and data changes
  useEffect(() => {
    if (!mapLoaded || !map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers = [];

    // Filter data based on current filters
    const filteredData = [];
    if (filterType === "all" || filterType === "requests") {
      filteredData.push(...requests.filter(req => 
        !filterEmergency || req.emergency.toLowerCase().includes(filterEmergency.toLowerCase())
      ));
    }
    if (filterType === "all" || filterType === "pledges") {
      filteredData.push(...pledges.filter(pledge => 
        !filterEmergency || (pledge.emergencyTypes && pledge.emergencyTypes.some(e => 
          e.toLowerCase().includes(filterEmergency.toLowerCase())
        ))
      ));
    }

    // Create markers for each item
    filteredData.forEach(item => {
      // For demo purposes, we'll use a geocoding service to convert addresses to coordinates
      // In a production app, you would store coordinates with each item
      geocodeAddress(item.location, (lat, lng) => {
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: item.location,
          icon: item.type === "request" ? 
            "http://maps.google.com/mapfiles/ms/icons/red-dot.png" : 
            "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        });

        // Add click event to marker
        marker.addListener("click", () => {
          setSelectedItem(item);
        });

        newMarkers.push(marker);
      });
    });

    setMarkers(newMarkers);
  }, [mapLoaded, map, requests, pledges, filterType, filterEmergency]);

  // Geocode address to get coordinates (in a real app, you'd use a proper geocoding service)
  const geocodeAddress = (address, callback) => {
    // This is a placeholder. In a real app, you would use the Google Maps Geocoding API
    // For demo purposes, we'll generate random coordinates near San Francisco
    const lat = 37.7749 + (Math.random() - 0.5) * 0.1;
    const lng = -122.4194 + (Math.random() - 0.5) * 0.1;
    callback(lat, lng);
  };

  return (
    <div className="page">
      <h2>Map Search</h2>
      <p className="subtitle">Find help or offer assistance based on location</p>
      
      <div className="map-filters">
        <div className="filter-group">
          <label>Show:</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="requests">Requests for Help</option>
            <option value="pledges">Offers to Help</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Emergency Type:</label>
          <input 
            type="text" 
            value={filterEmergency} 
            onChange={(e) => setFilterEmergency(e.target.value)}
            placeholder="e.g., Fire, Flood, Earthquake"
          />
        </div>
      </div>
      
      <div className="map-container">
        <div id="map" style={{ height: "400px", width: "100%" }}></div>
        
        {selectedItem && (
          <div className="map-info-panel">
            <h3>{selectedItem.type === "request" ? "Request for Help" : "Offer to Help"}</h3>
            <p><strong>Location:</strong> {selectedItem.location}</p>
            
            {selectedItem.type === "request" ? (
              <>
                <p><strong>Emergency:</strong> {selectedItem.emergency}</p>
                <p><strong>Party Size:</strong> {selectedItem.partySize}</p>
                <p><strong>Nights Needed:</strong> {selectedItem.nightsNeeded}</p>
                <p><strong>Space Needed:</strong> {selectedItem.typeOfSpace}</p>
              </>
            ) : (
              <>
                <p><strong>Space Type:</strong> {selectedItem.spaceType}</p>
                <p><strong>Max Party Size:</strong> {selectedItem.maxPartySize}</p>
                <p><strong>Nights Offered:</strong> {selectedItem.nightsOffered}</p>
                <p><strong>Pet Friendly:</strong> {selectedItem.petFriendly ? "Yes" : "No"}</p>
              </>
            )}
            
            <button onClick={() => setSelectedItem(null)}>Close</button>
          </div>
        )}
      </div>
      
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-marker request-marker"></div>
          <span>Requests for Help</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker pledge-marker"></div>
          <span>Offers to Help</span>
        </div>
      </div>
      
      <div className="map-instructions">
        <h3>How to Use the Map</h3>
        <ul>
          <li>Red markers represent people who need help</li>
          <li>Green markers represent people offering help</li>
          <li>Click on a marker to see details</li>
          <li>Use the filters above to narrow your search</li>
          <li>Contact information is only available to verified users</li>
        </ul>
      </div>
    </div>
  );
}

export default MapSearchPage;