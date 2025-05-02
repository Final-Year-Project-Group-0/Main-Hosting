import React, { useReducer, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gigReducer, INITIAL_STATE } from "../../reducers/gigReducer";
import newRequest from "../../utils/newRequest";
import upload from "../../utils/upload";
import "./Add.css";

const Add = () => {
  const [singleFile, setSingleFile] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check dark mode on mount and listen for changes
  useEffect(() => {
    const updateDarkMode = () => {
      setDarkMode(localStorage.getItem("darkMode") === "true");
    };

    // Initial check
    updateDarkMode();

    // Set up event listener for storage changes
    window.addEventListener('storage', updateDarkMode);
    window.addEventListener('darkModeChange', updateDarkMode);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', updateDarkMode);
      window.removeEventListener('darkModeChange', updateDarkMode);
    };
  }, []);

  const handleChange = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });
  };

  const handleFeature = (e) => {
    e.preventDefault();
    if (!e.target[0].value.trim()) return;
    
    dispatch({
      type: "ADD_FEATURE",
      payload: e.target[0].value,
    });
    e.target[0].value = "";
  };

  const handleUpload = async () => {
    if (!singleFile) {
      setError("Please select a cover image");
      return;
    }

    setError(null);
    setUploading(true);
    
    try {
      const cover = await upload(singleFile);

      const images = await Promise.all(
        [...files].map(async (file) => {
          const url = await upload(file);
          return url;
        })
      );
      
      setUploading(false);
      dispatch({ type: "ADD_IMAGES", payload: { cover, images } });
      setSuccess(true);
      
      // Move to next step after successful upload
      setActiveStep(2);
    } catch (err) {
      console.log(err);
      setError("Error uploading files. Please try again.");
      setUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: (gig) => {
      return newRequest.post("/gigs", gig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
      setSuccess(true);
      setTimeout(() => {
        navigate("/mygigs");
      }, 2000);
    },
    onError: (error) => {
      setError(error.response?.data || "Failed to create gig");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!state.title || !state.desc || !state.cat || !state.price || !state.shortTitle || !state.shortDesc || !state.deliveryTime || !state.revisionNumber) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (!state.cover) {
      setError("Please upload a cover image");
      return;
    }
    
    setError(null);
    mutation.mutate(state);
  };

  return (
    <div className={`add-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="add-wrapper">
        <div className="add-header">
          <h1 className="add-title">Add New Gig</h1>
          <p className="add-subtitle">
            Share your services with potential clients by creating a detailed gig
          </p>
        </div>

        {error && (
          <div className="error-message">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="error-icon"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="success-icon"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 12L10.5 14.5L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Operation successful! {mutation.isSuccess && "Redirecting..."}</span>
          </div>
        )}

        <div className="add-form">
          <div className="form-header">
            <div className={`form-step ${activeStep === 1 ? "active" : ""}`}>
              <div className="step-number">1</div>
              <div className="step-label">Basic Information</div>
            </div>
            <div className="step-divider"></div>
            <div className={`form-step ${activeStep === 2 ? "active" : ""}`}>
              <div className="step-number">2</div>
              <div className="step-label">Service Details</div>
            </div>
          </div>

          {activeStep === 1 ? (
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="title">
                  Gig Title <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="e.g. I will design a professional logo for your business"
                  onChange={handleChange}
                  value={state.title || ""}
                />
                <small className="field-hint">
                  A catchy title will help you stand out from the competition
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="cat">
                  Category <span className="required-star">*</span>
                </label>
                <select 
                  name="cat" 
                  id="cat" 
                  onChange={handleChange}
                  defaultValue=""
                >
                  <option value="" disabled>Select a category</option>
                  <option value="design">Design</option>
                  <option value="web">Web Development</option>
                  <option value="animation">Animation</option>
                  <option value="music">Music</option>
                  <option value="digital-marketing">Digital Marketing</option>
                  <option value="writing">Content Writing</option>
                  <option value="video">Video & Animation</option>
                  <option value="seo">SEO</option>
                </select>
              </div>

              <div className="form-group upload-section">
                <label htmlFor="coverImage">
                  Cover Image <span className="required-star">*</span>
                </label>
                <div className="file-input-container">
                  <input
                    type="file"
                    id="coverImage"
                    onChange={(e) => setSingleFile(e.target.files[0])}
                    className="file-input"
                  />
                  <div className="file-input-label">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 16V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 11L12 8L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 16.7428C20 17.2635 19.7531 17.7531 19.3241 18.0745C18.8951 18.3959 18.3386 18.5 17.8014 18.5H6.2007C5.38128 18.5 4.5 17.8358 4.5 16.7428C4.5 15.6498 5.38128 15 6.2007 15H17.7993C18.3386 15 18.8951 15.1041 19.3241 15.4255C19.7531 15.7469 20 16.2221 20 16.7428Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{singleFile ? singleFile.name : "Choose Cover Image"}</span>
                  </div>
                </div>
                <small className="field-hint">
                  Upload a high-quality image (recommended size: 1200x800px)
                </small>
              </div>

              <div className="form-group upload-section">
                <label htmlFor="galleryImages">Gallery Images</label>
                <div className="file-input-container">
                  <input
                    type="file"
                    id="galleryImages"
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                    className="file-input"
                  />
                  <div className="file-input-label">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M4 15L7.5 11.5C8.32843 10.6716 9.67157 10.6716 10.5 11.5L16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 14L14.5 12.5C15.3284 11.6716 16.6716 11.6716 17.5 12.5L20 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="9" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <span>{files.length > 0 ? `${files.length} files selected` : "Choose Gallery Images"}</span>
                  </div>
                </div>
                <small className="field-hint">
                  Add up to 5 images to showcase your work (optional)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="desc">
                  Description <span className="required-star">*</span>
                </label>
                <textarea
                  name="desc"
                  id="desc"
                  placeholder="Provide a detailed description of your services, process, and what clients can expect"
                  rows="8"
                  onChange={handleChange}
                  value={state.desc || ""}
                ></textarea>
                <small className="field-hint">
                  Be detailed and specific about your process, deliverables, and timeline
                </small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate("/mygigs")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="next-btn"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Uploading...
                    </>
                  ) : (
                    "Continue to Details"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="shortTitle">
                  Service Title <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="shortTitle"
                  name="shortTitle"
                  placeholder="e.g. Professional Logo Design"
                  onChange={handleChange}
                  value={state.shortTitle || ""}
                />
                <small className="field-hint">
                  A concise title for your specific service
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="shortDesc">
                  Short Description <span className="required-star">*</span>
                </label>
                <textarea
                  name="shortDesc"
                  id="shortDesc"
                  placeholder="Briefly describe your service in 100-150 characters"
                  rows="4"
                  onChange={handleChange}
                  value={state.shortDesc || ""}
                ></textarea>
                <small className="field-hint">
                  This will appear in search results and card previews
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="deliveryTime">
                    Delivery Time (days) <span className="required-star">*</span>
                  </label>
                  <input
                    type="number"
                    id="deliveryTime"
                    name="deliveryTime"
                    min="1"
                    placeholder="e.g. 3"
                    onChange={handleChange}
                    value={state.deliveryTime || ""}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="revisionNumber">
                    Revision Number <span className="required-star">*</span>
                  </label>
                  <input
                    type="number"
                    id="revisionNumber"
                    name="revisionNumber"
                    min="0"
                    placeholder="e.g. 2"
                    onChange={handleChange}
                    value={state.revisionNumber || ""}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="features">Add Features</label>
                <form className="feature-form" onSubmit={handleFeature}>
                  <input
                    type="text"
                    placeholder="e.g. Source Files Included"
                  />
                  <button type="submit" className="add-feature-btn">
                    Add
                  </button>
                </form>
                <small className="field-hint">
                  Add key features of your service to highlight what's included
                </small>
              </div>

              {state?.features?.length > 0 && (
                <div className="features-list">
                  {state.features.map((feature, index) => (
                    <div className="feature-tag" key={`feature-${index}`}>
                      <span>{feature}</span>
                      <button
                        onClick={() =>
                          dispatch({
                            type: "REMOVE_FEATURE",
                            payload: feature,
                          })
                        }
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18 6L6 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6 6L18 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="form-group price-input">
                <label htmlFor="price">
                  Price (USD) <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="5"
                    placeholder="e.g. 50"
                    onChange={handleChange}
                    value={state.price || ""}
                  />
                </div>
                <small className="field-hint">Set a competitive price for your service</small>
              </div>

              <div className="selling-tips">
                <div className="tips-header">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 14V10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="10"
                      cy="7"
                      r="1"
                      fill="currentColor"
                    />
                    <circle
                      cx="10"
                      cy="10"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <h3>Tips for a Successful Gig</h3>
                </div>
                <ul>
                  <li>Use high-quality images that showcase your work</li>
                  <li>Be specific about what's included in your package</li>
                  <li>Set realistic delivery times to maintain good ratings</li>
                  <li>Price competitively for your skill level and market</li>
                </ul>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => setActiveStep(1)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Creating...
                    </>
                  ) : (
                    "Create Gig"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Add;