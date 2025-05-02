// src/pages/googleRegister/GoogleRegister.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { completeGoogleRegistration } from "../../utils/firebaseAuth";
import "./GoogleRegister.scss";

function GoogleRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    country: "",
    isSeller: false,
    phone: "",
    desc: ""
  });
  
  // Get userData from location state or redirect back to register page
  useEffect(() => {
    if (location.state?.userData) {
      setUserData(location.state.userData);
      setFormData(prev => ({
        ...prev,
        username: location.state.userData.suggestedUsername || ""
      }));
    } else {
      navigate('/register');
    }
  }, [location, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSellerToggle = (e) => {
    setFormData(prev => ({
      ...prev,
      isSeller: e.target.checked
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.username || !formData.country) {
      setError("Username and country are required fields");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await completeGoogleRegistration(userData, formData);
      // The function will handle redirect on success
    } catch (err) {
      setError(err.response?.data || "Error completing registration");
      setLoading(false);
    }
  };
  
  if (!userData) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="google-register">
      <div className="container">
        <h1>Complete Your Registration</h1>
        <p>You're almost there! Please provide a few more details to complete your account setup.</p>
        
        <div className="user-info">
          <img src={userData.photo} alt="Profile" className="profile-image" />
          <div className="user-details">
            <p className="name">{userData.name}</p>
            <p className="email">{userData.email}</p>
          </div>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="country">Country *</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="seller-toggle">
            <label>Account Type</label>
            <div className="toggle-container">
              <label htmlFor="isSeller" className="toggle-label">
                I want to be a seller (offer services)
              </label>
              <label className="switch">
                <input
                  type="checkbox"
                  id="isSeller"
                  checked={formData.isSeller}
                  onChange={handleSellerToggle}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
          
          {formData.isSeller && (
            <>
              <div className="input-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="desc">Description</label>
                <textarea
                  id="desc"
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  placeholder="Describe your skills and services"
                  rows="4"
                ></textarea>
              </div>
            </>
          )}
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default GoogleRegister;