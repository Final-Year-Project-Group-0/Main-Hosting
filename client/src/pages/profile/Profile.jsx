// src/pages/profile/Profile.jsx
import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import upload from "../../utils/upload";
import { auth } from "../../utils/firebase";
import "./Profile.scss";

const DEFAULT_AVATAR = "/img/noavatar.jpg";

const Profile = () => {
  // =============================================
  // SECTION 1: HOOKS AND STATE INITIALIZATION
  // =============================================
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  // Get user from localStorage and context
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [user, setUser] = useOutletContext();
  const id = currentUser?._id;

  // Initialize form state
  const [formData, setFormData] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    return {
      username: storedUser?.username || "",
      email: storedUser?.email || "",
      country: storedUser?.country || "",
      phone: storedUser?.phone || "",
      desc: storedUser?.desc || "",
      img: storedUser?.img || DEFAULT_AVATAR,
      skills: storedUser?.skills || "",
      githubUsername: storedUser?.githubUsername || ""
    };
  });

  // UI state
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [activeSection, setActiveSection] = useState("personal");
  
  // GitHub specific state
  const [githubLinking, setGithubLinking] = useState(false);
  const [githubSuccess, setGithubSuccess] = useState(null);
  const [githubError, setGithubError] = useState(null);
  const [githubPopup, setGithubPopup] = useState(null);

  // =============================================
  // SECTION 2: EFFECTS
  // =============================================
  
  // Monitor GitHub popup window and refresh when closed
  useEffect(() => {
    if (!githubPopup) return;
    
    console.log("Setting up GitHub popup monitor");
    
    // Poll to check if popup is closed
    const popupMonitor = setInterval(() => {
      if (githubPopup && githubPopup.closed) {
        console.log("GitHub popup was closed - refreshing parent window");
        clearInterval(popupMonitor);
        setGithubPopup(null);
        
        // Force a refresh to get the updated data
        window.location.reload();
      }
    }, 500);
    
    // Cleanup on unmount
    return () => {
      clearInterval(popupMonitor);
    };
  }, [githubPopup]);

  // =============================================
  // SECTION 3: DATA FETCHING
  // =============================================
  // Fetch user data
  const { isLoading, error, data } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => newRequest.get(`/users/${id}`).then((res) => res.data),
    enabled: !!id, // Only run the query if we have a user ID
    onSuccess: (fetchedData) => {
      // Update form with fetched data
      setFormData({
        username: fetchedData.username || "",
        email: fetchedData.email || "",
        country: fetchedData.country || "",
        phone: fetchedData.phone || "",
        desc: fetchedData.desc || "",
        img: fetchedData.img || DEFAULT_AVATAR,
        skills: fetchedData.skills || "",
        githubUsername: fetchedData.githubUsername || ""
      });
    }
  });

  // Update profile mutation
  const mutation = useMutation({
    mutationFn: (updatedProfile) => {
      return newRequest.put(`/users/${id}`, updatedProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["profile", id]);
      setSaveSuccess(true);

      // Update localStorage with new data
      const updatedUser = { ...currentUser, ...formData };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      // Update context user
      if (setUser) {
        setUser(updatedUser);
      }

      // Trigger an event to update other components (like Navbar)
      window.dispatchEvent(new Event('userProfileUpdated'));

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    },
  });

  // =============================================
  // SECTION 4: EVENT HANDLERS
  // =============================================
  // Handle file input click
  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  // Handle file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await upload(file);
      setFormData((prev) => ({ ...prev, img: url }));
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset errors
    setFormErrors({});

    // Basic validation
    let valid = true;
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required";
      valid = false;
    }

    if (!formData.country.trim()) {
      errors.country = "Country is required";
      valid = false;
    }

    if (currentUser.isSeller && !formData.desc.trim()) {
      errors.desc = "Description is required for freelancer accounts";
      valid = false;
    }

    if (!valid) {
      setFormErrors(errors);
      return;
    }

    // Submit the form
    mutation.mutate(formData);
  };

  // Handle tab click
  const handleTabClick = (section) => {
    setActiveSection(section);
    // Clear GitHub messages when switching sections
    setGithubSuccess(null);
    setGithubError(null);
  };

  // =============================================
  // SECTION 5: GITHUB INTEGRATION
  // =============================================
  // GitHub OAuth function
  const handleAutoConnectGithub = async () => {
    try {
      setGithubLinking(true);
      setGithubError(null);
      setGithubSuccess(null);
    
      console.log("Starting GitHub OAuth process...");
      
      // Get the GitHub OAuth URL from the existing endpoint
      const authUrlResponse = await newRequest.get('/firebase/github-auth-url');
      const githubAuthUrl = authUrlResponse.data.url;
      
      // Ensure we have a valid user ID
      if (!currentUser || !currentUser._id) {
        throw new Error("User information is not available. Please reload the page or log in again.");
      }
      
      // Create popup window for GitHub OAuth
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      // Store the current user ID in localStorage for the callback
      localStorage.setItem('github_auth_user_id', currentUser._id);
      
      // Open the popup window for authentication
      const popup = window.open(
        githubAuthUrl,
        'githubAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (!popup) {
        throw new Error("Popup was blocked. Please allow popups for this site and try again.");
      }
      
      // Store the popup in state to enable monitoring
      setGithubPopup(popup);
      
      // Setup event listener for message from popup
      const messageHandler = async (event) => {
        // Only accept messages from our own domain
        if (event.origin !== window.location.origin) {
          return;
        }
        
        console.log("Received message from popup:", event.data);
        
        if (event.data.type === 'github-auth-success') {
          const { githubUsername, autoSaved } = event.data;
          
          if (!githubUsername) {
            setGithubError("GitHub username not received");
            setGithubLinking(false);
            window.removeEventListener('message', messageHandler);
            return;
          }
          
          // Clean up event listener
          window.removeEventListener('message', messageHandler);
          
          try {
            // If not auto-saved on the backend, manually update the profile
            if (!autoSaved) {
              console.log("Manually updating profile with GitHub username");
              
              // Update the backend
              await newRequest.put(`/users/${currentUser._id}`, {
                githubUsername: githubUsername
              });
            }
            
            // Update localStorage
            const updatedUser = {
              ...currentUser,
              githubUsername: githubUsername
            };
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            
            // Show success message
            setGithubSuccess("GitHub account successfully linked!");
            setGithubLinking(false);
            
            // Note: We don't need to force a refresh here
            // The useEffect hook monitoring the popup will handle that
            
          } catch (error) {
            console.error("Error updating profile with GitHub username:", error);
            setGithubError("Failed to update profile with GitHub username");
            setGithubLinking(false);
          }
        }
        
        if (event.data.type === 'github-auth-error') {
          setGithubError(event.data.error || "GitHub authentication failed");
          window.removeEventListener('message', messageHandler);
          setGithubLinking(false);
        }
      };
      
      window.addEventListener('message', messageHandler);
      
    } catch (err) {
      console.error("GitHub OAuth error:", err);
      setGithubError(err.message || "GitHub authentication failed");
      setGithubLinking(false);
    }
  };

  // =============================================
  // SECTION 6: RENDER FUNCTIONS
  // =============================================
  // Loading state
  if (isLoading) {
    return (
      <div className="profile-edit-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="profile-edit-container">
        <div className="error-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </svg>
          <h3>Error Loading Profile</h3>
          <p>{error.response?.data || error.message || "Something went wrong"}</p>
          <button className="retry-button" onClick={() => queryClient.invalidateQueries(["profile", id])}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="profile-edit-container">
      <div className="profile-edit-wrapper">
        {/* Profile Header */}
        <div className="profile-edit-header">
          <h1>My Profile</h1>
          <p>Update your information and manage your account settings</p>
          
          <div className="profile-actions">
            <Link to={`/profile/${id}`} className="view-public-profile">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              View Public Profile
            </Link>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-edit-content">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-image-section">
              <div className="profile-image-container" onClick={handleFileInputClick}>
                <img
                  src={formData.img || DEFAULT_AVATAR}
                  alt={formData.username}
                  className="profile-image"
                  onError={(e) => {
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
                {uploading && (
                  <div className="uploading-overlay">
                    <div className="spinner-small"></div>
                  </div>
                )}
              </div>
              
              <div className="image-actions">
                <button
                  type="button"
                  className="change-photo-btn"
                  onClick={handleFileInputClick}
                  disabled={uploading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  Change Photo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
              
              <div className="user-info">
                <h3>{formData.username}</h3>
                <p className="user-type">{currentUser.isSeller ? "Freelancer" : "Client"}</p>
              </div>
            </div>
            
            <div className="navigation-menu">
              <button
                className={`nav-item ${activeSection === 'personal' ? 'active' : ''}`}
                onClick={() => handleTabClick('personal')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Personal Information
              </button>
              
              {currentUser.isSeller && (
                <button
                  className={`nav-item ${activeSection === 'professional' ? 'active' : ''}`}
                  onClick={() => handleTabClick('professional')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  Professional Details
                </button>
              )}
              
              {currentUser.isSeller && (
                <button
                  className={`nav-item ${activeSection === 'github' ? 'active' : ''}`}
                  onClick={() => handleTabClick('github')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                  GitHub Integration
                </button>
              )}
              
              <button
                className={`nav-item ${activeSection === 'security' ? 'active' : ''}`}
                onClick={() => handleTabClick('security')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Security
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="profile-form-container">
            {saveSuccess && (
              <div className="success-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p>Profile updated successfully!</p>
              </div>
            )}

            {mutation.error && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>{mutation.error.response?.data || "Failed to update profile"}</p>
              </div>
            )}

            {/* Personal Information Tab */}
            {activeSection === 'personal' && (
              <div className="form-section">
                <h2>Personal Information</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="username">Username <span className="required">*</span></label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={formErrors.username ? 'has-error' : ''}
                    />
                    {formErrors.username && <span className="error-message">{formErrors.username}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="readonly"
                    />
                    <span className="field-hint">Email cannot be changed</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Country <span className="required">*</span></label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={formErrors.country ? 'has-error' : ''}
                    />
                    {formErrors.country && <span className="error-message">{formErrors.country}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      placeholder="e.g., +1 (123) 456-7890"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="cancel-btn">
                      Cancel
                    </button>
                    <button type="submit" className="save-btn" disabled={mutation.isLoading}>
                      {mutation.isLoading ? (
                        <>
                          <span className="spinner-small"></span>
                          Saving...
                        </>
                      ) : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Professional Details Tab */}
            {activeSection === 'professional' && currentUser.isSeller && (
              <div className="form-section">
                <h2>Professional Details</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="desc">
                      Professional Description <span className="required">*</span>
                    </label>
                    <textarea
                      id="desc"
                      name="desc"
                      rows="5"
                      placeholder="Tell clients about your professional background, expertise, and experience..."
                      value={formData.desc}
                      onChange={handleChange}
                      className={formErrors.desc ? 'has-error' : ''}
                    ></textarea>
                    {formErrors.desc && <span className="error-message">{formErrors.desc}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="skills">Skills</label>
                    <input
                      type="text"
                      id="skills"
                      name="skills"
                      placeholder="e.g., JavaScript, React, Node.js (comma-separated)"
                      value={formData.skills}
                      onChange={handleChange}
                    />
                    <span className="field-hint">Enter your skills separated by commas</span>
                    
                    {formData.skills && (
                      <div className="skills-preview">
                        {formData.skills.split(',').map((skill, index) => (
                          <span key={index} className="skill-tag">{skill.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="button" className="cancel-btn">
                      Cancel
                    </button>
                    <button type="submit" className="save-btn" disabled={mutation.isLoading}>
                      {mutation.isLoading ? (
                        <>
                          <span className="spinner-small"></span>
                          Saving...
                        </>
                      ) : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* GitHub Integration Tab */}
            {activeSection === 'github' && currentUser?.isSeller && (
              <div className="form-section">
                <h2>GitHub Integration</h2>

                <div className="github-section">
                  <div className="github-info">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor" />
                    </svg>

                    <div className="github-text">
                      <h3>GitHub Account</h3>
                      <p>Connect your GitHub account to showcase your repositories and coding skills to potential clients.</p>
                    </div>
                  </div>

                  {githubSuccess && (
                    <div className="success-message">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor" />
                      </svg>
                      <p>{githubSuccess}</p>
                    </div>
                  )}

                  {githubError && (
                    <div className="error-message">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor" />
                      </svg>
                      <p>{githubError}</p>
                    </div>
                  )}
                  
                  {/* Show connected state if user has GitHub username in their profile */}
                  {(formData.githubUsername || data?.githubUsername) ? (
                    <div className="github-connected">
                      <div className="github-profile">
                        <div className="github-profile-info">
                          <h3>Connected GitHub Account</h3>
                          <div className="github-username">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor" />
                            </svg>
                            <a
                              href={`https://github.com/${formData.githubUsername || data?.githubUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {formData.githubUsername || data?.githubUsername}
                            </a>
                          </div>
                          
                          <div className="github-stats">
                            <a 
                              href={`https://github.com/${formData.githubUsername || data?.githubUsername}?tab=repositories`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="github-repos-link"
                            >
                              View repositories
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="github-actions">
                      <button
                        type="button"
                        className="link-github-btn"
                        onClick={handleAutoConnectGithub}
                        disabled={githubLinking}
                      >
                        {githubLinking ? (
                          <>
                            <span className="spinner-small"></span>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                            </svg>
                            Connect GitHub Account
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeSection === 'security' && (
              <div className="form-section">
                <h2>Security</h2>
                
                <div className="security-section">
                  <div className="security-info">
                    <h3>Password Management</h3>
                    
                    {currentUser.googleId || currentUser.githubId ? (
                      <div className="oauth-info">
                        <p>You're signed in with an external provider. Password management is handled by your provider.</p>
                        <div className="oauth-providers">
                          {currentUser.googleId && (
                            <div className="oauth-provider google">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 1 1 0-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0 0 12.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" fill="#4285F4" />
                              </svg>
                              Google Account
                            </div>
                          )}

                          {currentUser.githubId && (
                            <div className="oauth-provider github">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor" />
                              </svg>
                              GitHub Account
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="password-change">
                        <p>We recommend changing your password regularly to keep your account secure.</p>
                        <button className="change-password-btn">
                          Change Password
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="account-section">
                    <h3>Account Management</h3>
                    <p>Need to close your account?</p>
                    <button type="button" className="delete-account-btn">
                      Delete Account
                    </button>
                    <p className="delete-notice">This action cannot be undone. All your data will be permanently removed.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;