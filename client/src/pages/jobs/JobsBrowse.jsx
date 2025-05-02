import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./JobsBrowse.css";
import JobCard from "../../components/jobCard/JobCard";

const JobsBrowse = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );
  
  const [filters, setFilters] = useState({
    category: "",
    minBudget: "",
    maxBudget: "",
    deadline: "", // "upcoming", "week", "month"
    status: "open", // default to show only open jobs
  });
  const location = useLocation();
  const navigate = useNavigate();
  // Categories that match your existing gig categories
  const categories = [
    "All Categories",
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
  // Extract any initial category from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    
    if (categoryParam) {
      setFilters(prev => ({
        ...prev,
        category: categoryParam
      }));
    }
  }, [location.search]);
  // Fetch jobs with filters
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (filters.category && filters.category !== "All Categories") {
          params.append("category", filters.category);
        }
        
        if (filters.minBudget) {
          params.append("min", filters.minBudget);
        }
        
        if (filters.maxBudget) {
          params.append("max", filters.maxBudget);
        }
        
        if (filters.status) {
          params.append("status", filters.status);
        }
        
        // Deadline filter logic will be handled client-side
        
        const queryString = params.toString();
        const url = `/jobs${queryString ? `?${queryString}` : ''}`;
        
        const response = await newRequest.get(url);
        setJobs(response.data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(err.response?.data || "Error fetching jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [filters]);
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Apply budget filter
  const handleApplyBudget = () => {
    // This will trigger the useEffect to fetch jobs with new filters
    setFilters(prev => ({
      ...prev,
      // Just refresh the state to trigger a refetch
      _timestamp: Date.now()
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      category: "",
      minBudget: "",
      maxBudget: "",
      deadline: "",
      status: "open",
    });
  };

  // Format the date as relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    
    if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
    
    return 'Just now';
  };

  // Calculate remaining days
  const calculateRemainingDays = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return "Expired";
    if (daysDiff === 0) return "Today";
    if (daysDiff === 1) return "1 day";
    return `${daysDiff} days`;
  };

  // Filter jobs by deadline
  const filterJobsByDeadline = (jobs) => {
    if (!filters.deadline) return jobs;
    
    const now = new Date();
    
    return jobs.filter(job => {
      const deadline = new Date(job.deadline);
      const timeDiff = deadline - now;
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      switch (filters.deadline) {
        case "urgent":
          return daysDiff <= 3 && daysDiff >= 0;
        case "week":
          return daysDiff <= 7 && daysDiff >= 0;
        case "month":
          return daysDiff <= 30 && daysDiff >= 0;
        default:
          return true;
      }
    });
  };

  // Get filtered jobs
  const filteredJobs = filterJobsByDeadline(jobs);
  
  return (
    <div className={`jobs-browse-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="jobs-browse-wrapper">
        <div className="jobs-browse-header">
          <div className="header-content">
            <h1>Browse Open Jobs</h1>
            <p className="subtitle">Find projects that match your skills and expertise</p>
          </div>
          
          {currentUser && !currentUser?.isSeller && (
            <Link to="/jobpost" className="post-job-button">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 3V13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 8H13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Post a New Job
            </Link>
          )}
        </div>

        <div className="jobs-browse-filters">
          <div className="filter-section">
            <div className="filter-group category-filter">
              <label htmlFor="category">Category</label>
              <select 
                id="category" 
                name="category" 
                value={filters.category} 
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map((cat, index) => (
                  cat !== "All Categories" && (
                    <option key={index} value={cat}>
                      {cat}
                    </option>
                  )
                ))}
              </select>
            </div>
            
            <div className="filter-group budget-filter">
              <label>Budget</label>
              <div className="budget-inputs">
                <input
                  type="number"
                  name="minBudget"
                  value={filters.minBudget}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  min="0"
                />
                <span className="separator">-</span>
                <input
                  type="number"
                  name="maxBudget"
                  value={filters.maxBudget}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  min="0"
                />
                <button 
                  className="apply-budget-btn"
                  onClick={handleApplyBudget}
                >
                  Apply
                </button>
              </div>
            </div>
            
            <div className="filter-group deadline-filter">
              <label htmlFor="deadline">Deadline</label>
              <select 
                id="deadline" 
                name="deadline" 
                value={filters.deadline} 
                onChange={handleFilterChange}
              >
                <option value="">Any Deadline</option>
                <option value="urgent">Urgent (3 days)</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            <div className="filter-group status-filter">
              <label htmlFor="status">Status</label>
              <select 
                id="status" 
                name="status" 
                value={filters.status} 
                onChange={handleFilterChange}
              >
                <option value="open">Open Jobs</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="">All Statuses</option>
              </select>
            </div>
          </div>
          
          <button 
            className="clear-filters-btn"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading jobs...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
            <p>{error}</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="no-jobs">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 12H18L15 21L9 3L6 12H2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h3>No jobs found</h3>
            <p>No jobs match your current filters. Try adjusting your search criteria.</p>
            <button 
              className="reset-search-btn"
              onClick={handleClearFilters}
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="jobs-results">
            <div className="results-header">
              <p className="results-count">
                Showing <span className="count">{filteredJobs.length}</span> jobs
              </p>
              
              <div className="sort-options">
                <span>Sort by:</span>
                <select 
                  name="sort" 
                  className="sort-select"
                  onChange={(e) => {
                    // Sort jobs based on selection
                    const sortOption = e.target.value;
                    let sortedJobs = [...jobs];
                    
                    if (sortOption === "newest") {
                      sortedJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    } else if (sortOption === "oldest") {
                      sortedJobs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    } else if (sortOption === "budget-high") {
                      sortedJobs.sort((a, b) => b.budget - a.budget);
                    } else if (sortOption === "budget-low") {
                      sortedJobs.sort((a, b) => a.budget - b.budget);
                    } else if (sortOption === "deadline") {
                      sortedJobs.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
                    }
                    
                    setJobs(sortedJobs);
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="budget-high">Budget: High to Low</option>
                  <option value="budget-low">Budget: Low to High</option>
                  <option value="deadline">Deadline: Soonest First</option>
                </select>
              </div>
            </div>
            
            <div className="jobs-list">
              {filteredJobs.map((job) => (
                <JobCard 
                  key={job._id} 
                  job={job} 
                  formatRelativeTime={formatRelativeTime}
                  calculateRemainingDays={calculateRemainingDays}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsBrowse;