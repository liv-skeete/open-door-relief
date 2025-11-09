import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalRequests: 0,
    totalPledges: 0,
    totalReliefCenters: 0,
    totalDonations: 0
  });
  
  const auth = getAuth();
  
  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!auth.currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      // Check if user is admin (only @opendoorrelief.org emails)
      const isOrgEmail = auth.currentUser.email.toLowerCase().endsWith('@opendoorrelief.org');
      
      setIsAdmin(isOrgEmail);
      setLoading(false);
      
      // If admin, fetch data
      if (isOrgEmail) {
        fetchStats();
      }
    };
    
    checkAdminStatus();
  }, [auth.currentUser]);
  
  // Fetch stats for the dashboard
  const fetchStats = async () => {
    setLoading(true);
    
    try {
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Fetch requests
      const requestsSnapshot = await getDocs(collection(db, "requests"));
      const requestsData = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Fetch pledges
      const pledgesSnapshot = await getDocs(collection(db, "pledges"));
      const pledgesData = pledgesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Fetch relief centers
      const centersSnapshot = await getDocs(collection(db, "reliefCenters"));
      const centersData = centersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      
      // Calculate stats
      const verifiedUsersCount = usersData.filter(user => 
        user.emailVerified || 
        (user.verification && user.verification.status === "completed")
      ).length;
      
      setStats({
        totalUsers: usersData.length,
        verifiedUsers: verifiedUsersCount,
        totalRequests: requestsData.length,
        totalPledges: pledgesData.length,
        totalReliefCenters: centersData.length
      });
      
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Render dashboard content based on active tab
  const renderDashboardContent = () => {
    if (loading) {
      return <div className="loading">Loading dashboard data...</div>;
    }
    
    switch (activeTab) {
      case "overview":
        return renderOverviewTab();
      case "users":
        return <div>Users Management (Coming Soon)</div>;
      case "requests":
        return <div>Requests Management (Coming Soon)</div>;
      case "pledges":
        return <div>Pledges Management (Coming Soon)</div>;
      case "reliefCenters":
        return <div>Relief Centers Management (Coming Soon)</div>;
      case "settings":
        return <div>Admin Settings (Coming Soon)</div>;
      default:
        return <div>Select a tab to view data</div>;
    }
  };
  
  // Render overview tab
  const renderOverviewTab = () => {
    return (
      <div className="admin-overview">
        <h3>Platform Overview</h3>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Users</h4>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-detail">
              <span>{stats.verifiedUsers} verified</span>
              <span>{stats.totalUsers - stats.verifiedUsers} unverified</span>
            </div>
          </div>
          
          <div className="stat-card">
            <h4>Requests</h4>
            <div className="stat-value">{stats.totalRequests}</div>
            <div className="stat-detail">
              <span>People seeking help</span>
            </div>
          </div>
          
          <div className="stat-card">
            <h4>Pledges</h4>
            <div className="stat-value">{stats.totalPledges}</div>
            <div className="stat-detail">
              <span>Offers to help</span>
            </div>
          </div>
          
          <div className="stat-card">
            <h4>Relief Centers</h4>
            <div className="stat-value">{stats.totalReliefCenters}</div>
            <div className="stat-detail">
              <span>Official resources</span>
            </div>
          </div>
          
          <div className="stat-card">
            <h4>Donations</h4>
            <div className="stat-value">{stats.totalDonations}</div>
            <div className="stat-detail">
              <span>Support received</span>
            </div>
          </div>
        </div>
        
        <div className="admin-message">
          <h3>Admin Dashboard</h3>
          <p>
            Welcome to the Open Door Relief admin dashboard. This interface provides
            an overview of platform activity and allows administrators to manage users,
            requests, pledges, and relief centers.
          </p>
          <p>
            Full management functionality will be implemented in the next phase of development.
            Currently, you can view basic statistics about the platform.
          </p>
        </div>
      </div>
    );
  };
  
  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <h2>Admin Dashboard</h2>
        <div className="access-denied-message">
          <h3>Access Denied</h3>
          <p>You do not have permission to access the admin dashboard.</p>
          <p>Please contact an administrator if you believe this is an error.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button 
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button 
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => setActiveTab("requests")}
        >
          Requests
        </button>
        <button 
          className={activeTab === "pledges" ? "active" : ""}
          onClick={() => setActiveTab("pledges")}
        >
          Pledges
        </button>
        <button 
          className={activeTab === "reliefCenters" ? "active" : ""}
          onClick={() => setActiveTab("reliefCenters")}
        >
          Relief Centers
        </button>
        <button 
          className={activeTab === "settings" ? "active" : ""}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>
      
      <div className="admin-dashboard-content">
        {renderDashboardContent()}
      </div>
    </div>
  );
}

export default AdminDashboard;