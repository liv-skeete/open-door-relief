import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, query, where, deleteDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";
import "./App.css";

function ReliefCentersPage() {
  const [reliefCenters, setReliefCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCity, setFilterCity] = useState("");
  const [filterType, setFilterType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    website: "",
    hours: "",
    type: "shelter", // shelter, food, medical, supplies
    services: "",
    notes: "",
    verified: false
  });

  const auth = getAuth();

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (auth.currentUser) {
        // In a real app, you would check against a list of admin users in Firestore
        // For demo purposes, we'll consider the test account as admin
        setIsAdmin(auth.currentUser.email.toLowerCase() === 'test@reliefapp.org');
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [auth.currentUser]);

  // Fetch relief centers from Firestore
  useEffect(() => {
    const fetchReliefCenters = async () => {
      try {
        setLoading(true);
        const centersSnapshot = await getDocs(collection(db, "reliefCenters"));
        const centersData = centersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReliefCenters(centersData);
      } catch (error) {
        console.error("Error fetching relief centers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReliefCenters();
  }, []);

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
    
    try {
      // Add new relief center to Firestore
      await addDoc(collection(db, "reliefCenters"), {
        ...formData,
        createdAt: new Date(),
        createdBy: auth.currentUser.uid
      });
      
      // Reset form and fetch updated list
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        website: "",
        hours: "",
        type: "shelter",
        services: "",
        notes: "",
        verified: false
      });
      
      setShowAddForm(false);
      
      // Fetch updated list
      const centersSnapshot = await getDocs(collection(db, "reliefCenters"));
      const centersData = centersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReliefCenters(centersData);
      
      alert("Relief center added successfully!");
    } catch (error) {
      console.error("Error adding relief center:", error);
      alert("Failed to add relief center. Please try again.");
    }
  };

  // Handle deleting a relief center
  const handleDelete = async (centerId) => {
    if (!isAdmin) return;
    
    if (window.confirm("Are you sure you want to delete this relief center?")) {
      try {
        await deleteDoc(doc(db, "reliefCenters", centerId));
        
        // Update state to remove the deleted center
        setReliefCenters(reliefCenters.filter(center => center.id !== centerId));
        
        alert("Relief center deleted successfully!");
      } catch (error) {
        console.error("Error deleting relief center:", error);
        alert("Failed to delete relief center. Please try again.");
      }
    }
  };

  // Filter relief centers based on current filters
  const filteredCenters = reliefCenters.filter(center => {
    const matchesCity = !filterCity || 
      center.city.toLowerCase().includes(filterCity.toLowerCase()) ||
      center.state.toLowerCase().includes(filterCity.toLowerCase()) ||
      center.zipCode.includes(filterCity);
    
    const matchesType = !filterType || center.type === filterType;
    
    return matchesCity && matchesType;
  });

  // Get unique cities and states for filter options
  const locations = [...new Set(reliefCenters.map(center => center.city))];
  
  return (
    <div className="page">
      <h2>Relief Centers</h2>
      <p className="subtitle">Find official support facilities and resources</p>
      
      <div className="relief-filters">
        <div className="filter-group">
          <label>Location:</label>
          <input 
            type="text" 
            value={filterCity} 
            onChange={(e) => setFilterCity(e.target.value)}
            placeholder="City, State, or ZIP"
          />
        </div>
        
        <div className="filter-group">
          <label>Type:</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="shelter">Shelter</option>
            <option value="food">Food Distribution</option>
            <option value="medical">Medical Aid</option>
            <option value="supplies">Supplies</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      {isAdmin && (
        <div className="admin-controls">
          <button 
            className="add-center-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancel" : "Add New Relief Center"}
          </button>
          
          {showAddForm && (
            <form onSubmit={handleSubmit} className="add-center-form">
              <h3>Add New Relief Center</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Name:</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Type:</label>
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange}
                    required
                  >
                    <option value="shelter">Shelter</option>
                    <option value="food">Food Distribution</option>
                    <option value="medical">Medical Aid</option>
                    <option value="supplies">Supplies</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Address:</label>
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
              
              <div className="form-row">
                <div className="form-group">
                  <label>Phone:</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Website:</label>
                  <input 
                    type="url" 
                    name="website" 
                    value={formData.website} 
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Hours:</label>
                <input 
                  type="text" 
                  name="hours" 
                  value={formData.hours} 
                  onChange={handleChange}
                  placeholder="e.g., Mon-Fri 9am-5pm"
                />
              </div>
              
              <div className="form-group">
                <label>Services:</label>
                <textarea 
                  name="services" 
                  value={formData.services} 
                  onChange={handleChange}
                  placeholder="List services provided"
                />
              </div>
              
              <div className="form-group">
                <label>Notes:</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange}
                  placeholder="Additional information"
                />
              </div>
              
              <div className="form-group checkbox">
                <label>
                  <input 
                    type="checkbox" 
                    name="verified" 
                    checked={formData.verified} 
                    onChange={handleChange}
                  />
                  Verified Official Center
                </label>
              </div>
              
              <div className="form-actions">
                <button type="submit">Add Relief Center</button>
                <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
      
      {loading ? (
        <div className="loading">Loading relief centers...</div>
      ) : filteredCenters.length === 0 ? (
        <div className="no-results">
          <p>No relief centers found matching your filters.</p>
          {isAdmin && (
            <button onClick={() => setShowAddForm(true)}>Add a New Relief Center</button>
          )}
        </div>
      ) : (
        <div className="relief-centers-list">
          {filteredCenters.map(center => (
            <div key={center.id} className={`relief-center-card ${center.type}`}>
              <div className="center-header">
                <h3>{center.name}</h3>
                {center.verified && <span className="verified-badge">✓ Verified</span>}
                {isAdmin && (
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(center.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
              
              <div className="center-type">{center.type.charAt(0).toUpperCase() + center.type.slice(1)}</div>
              
              <div className="center-address">
                <p>{center.address}</p>
                <p>{center.city}, {center.state} {center.zipCode}</p>
              </div>
              
              <div className="center-contact">
                {center.phone && <p><strong>Phone:</strong> {center.phone}</p>}
                {center.website && (
                  <p>
                    <strong>Website:</strong>{" "}
                    <a href={center.website} target="_blank" rel="noopener noreferrer">
                      {center.website}
                    </a>
                  </p>
                )}
                {center.hours && <p><strong>Hours:</strong> {center.hours}</p>}
              </div>
              
              {center.services && (
                <div className="center-services">
                  <strong>Services:</strong>
                  <p>{center.services}</p>
                </div>
              )}
              
              {center.notes && (
                <div className="center-notes">
                  <strong>Notes:</strong>
                  <p>{center.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="relief-centers-info">
        <h3>About Relief Centers</h3>
        <p>
          Relief centers are official facilities that provide various services during emergencies.
          These may include temporary shelter, food distribution, medical aid, and supplies.
        </p>
        <p>
          If you know of a relief center that is not listed here, please contact us or ask an
          administrator to add it to the database.
        </p>
        <p>
          <strong>Note:</strong> Always verify the information with the relief center directly
          before traveling, as hours and services may change during emergencies.
        </p>
      </div>
    </div>
  );
}

export default ReliefCentersPage;