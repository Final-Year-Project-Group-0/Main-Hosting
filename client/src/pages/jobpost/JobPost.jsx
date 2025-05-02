import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./JobPost.css";

const JobPost = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("currentUser")));
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Predefined categories that match your existing gig categories
  const categories = [
    "Web Development",
    "Mobile App Development",
    "Graphic Design",
    "Logo Design",
    "Digital Marketing",
    "Content Writing",
    "SEO",
    "Video Editing",
    "Animation",
    "Voice Over",
    "Translation",
    "Data Entry",
    "Virtual Assistant",
    "Other",
  ];

  // Set min date for deadline as tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

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

  // Check if user is logged in and not a seller
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.isSeller) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePreview = () => {
    // Basic validation before showing preview
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.category ||
      !formData.budget ||
      !formData.deadline
    ) {
      setError("Please fill in all fields before previewing");
      return;
    }
    
    setError(null);
    setShowPreview(true);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      if (
        !formData.title.trim() ||
        !formData.description.trim() ||
        !formData.category ||
        !formData.budget ||
        !formData.deadline
      ) {
        throw new Error("Please fill in all fields");
      }

      // Format the job data
      const jobData = {
        ...formData,
        budget: parseFloat(formData.budget),
      };

      console.log("Sending job data:", jobData);
      
      // Send the request to the backend
      const response = await newRequest.post("/jobs", jobData);
      console.log("Job created successfully:", response.data);
      
      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        category: "",
        budget: "",
        deadline: "",
      });

      // Redirect after short delay
      setTimeout(() => {
        navigate("/myjobs");
      }, 2000);
    } catch (err) {
      console.error("Error posting job:", err);
      setError(err.response?.data || err.message || "Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`job-post-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="job-post-wrapper">
        <div className="job-post-header">
          <h1 className="job-post-title">Post a New Job</h1>
          <p className="job-post-subtitle">
            Connect with talented freelancers by posting your project details below
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
            <span>Job posted successfully! Redirecting...</span>
          </div>
        )}

        {!showPreview ? (
          <form className="job-post-form" onSubmit={(e) => { e.preventDefault(); handlePreview(); }}>
            <div className="form-header">
              <div className="form-step active">
                <div className="step-number">1</div>
                <div className="step-label">Job Details</div>
              </div>
              <div className="step-divider"></div>
              <div className="form-step">
                <div className="step-number">2</div>
                <div className="step-label">Review & Post</div>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="title">Job Title <span className="required-star">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="E.g., Website Redesign, Mobile App Development"
                required
              />
              <small className="field-hint">A clear, concise title helps attract the right freelancers</small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Job Description <span className="required-star">*</span></label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed information about your project requirements, goals, and expectations"
                rows="6"
                required
              ></textarea>
              <small className="field-hint">Be specific about deliverables, skills required, and project scope</small>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category <span className="required-star">*</span></label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget">Budget (USD) <span className="required-star">*</span></label>
                <div className="input-with-icon">
                  {/* <span className="currency-symbol">$</span> */}
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="Fixed project budget"
                    min="5"
                    step="1"
                    required
                  />
                </div>
                <small className="field-hint">Set a realistic budget to attract quality freelancers</small>
              </div>

              <div className="form-group">
                <label htmlFor="deadline">Deadline <span className="required-star">*</span></label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={minDate}
                  required
                />
                <small className="field-hint">When do you need this project completed?</small>
              </div>
            </div>

            <div className="job-posting-tips">
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
                <h3>Tips for a Great Job Post</h3>
              </div>
              <ul>
                <li>Be specific about your requirements</li>
                <li>Set a realistic budget for quality work</li>
                <li>Provide examples or references if possible</li>
                <li>Include your timeline and milestones</li>
              </ul>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/myjobs")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
              >
                Review Job
              </button>
            </div>
          </form>
        ) : (
          <div className="job-post-form job-preview">
            <div className="form-header">
              <div className="form-step">
                <div className="step-number">1</div>
                <div className="step-label">Job Details</div>
              </div>
              <div className="step-divider"></div>
              <div className="form-step active">
                <div className="step-number">2</div>
                <div className="step-label">Review & Post</div>
              </div>
            </div>
            
            <div className="preview-header">
              <h2>Review Your Job Posting</h2>
              <p>Please review your job details before posting.</p>
            </div>
            
            <div className="preview-content">
              <div className="preview-section">
                <h3 className="preview-title">{formData.title}</h3>
                <span className="preview-category">{formData.category}</span>
              </div>
              
              <div className="preview-section">
                <div className="preview-meta">
                  <div className="meta-item">
                    <strong>Budget:</strong> ${parseFloat(formData.budget).toFixed(2)}
                  </div>
                  <div className="meta-item">
                    <strong>Deadline:</strong> {formatDate(formData.deadline)}
                  </div>
                </div>
              </div>
              
              <div className="preview-section">
                <h4>Job Description</h4>
                <p className="preview-description">{formData.description}</p>
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowPreview(false)}
              >
                Edit Job
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Posting...
                  </>
                ) : (
                  "Post Job"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPost;