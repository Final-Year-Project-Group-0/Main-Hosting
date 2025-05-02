import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./MyJobs.css";

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    setDarkMode(
      localStorage.getItem("darkMode") === "true" ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await newRequest.get("/jobs/myjobs");
        setJobs(response.data);
      } catch (err) {
        setError(err.response?.data || "Something went wrong!");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await newRequest.delete(`/jobs/${id}`);
        setJobs(jobs.filter((job) => job._id !== id));
      } catch (err) {
        console.error(err);
        alert(err.response?.data || "Could not delete the job");
      }
    }
  };

  // Format the date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case "open":
        return "status-open";
      case "in-progress":
        return "status-progress";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  // Filter jobs based on active filter
  const getFilteredJobs = () => {
    if (activeFilter === "all") return jobs;
    return jobs.filter(job => job.status === activeFilter);
  };

  const filteredJobs = getFilteredJobs();

  return (
    <div className={`my-jobs-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="my-jobs-wrapper">
        <div className="my-jobs-header">
          <div className="header-left">
            <h1>My Job Postings</h1>
            <p className="subtitle">Manage and track all your job postings in one place</p>
          </div>
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
        </div>

        {!loading && !error && jobs.length > 0 && (
          <div className="filter-controls">
            <button 
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Jobs
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'open' ? 'active' : ''}`}
              onClick={() => setActiveFilter('open')}
            >
              Open
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'in-progress' ? 'active' : ''}`}
              onClick={() => setActiveFilter('in-progress')}
            >
              In Progress
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveFilter('completed')}
            >
              Completed
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your jobs...</p>
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
        ) : jobs.length === 0 ? (
          <div className="no-jobs">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 12V16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 14H14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h3>No Jobs Posted Yet</h3>
            <p>You haven't posted any jobs yet. Click the button above to create your first job posting and start finding talented freelancers.</p>
            <Link to="/jobpost" className="empty-state-button">
              Post Your First Job
            </Link>
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
            <h3>No {activeFilter !== 'all' ? activeFilter.replace('-', ' ') : ''} Jobs Found</h3>
            <p>You don't have any {activeFilter !== 'all' ? activeFilter.replace('-', ' ') : ''} jobs at the moment.</p>
            <button onClick={() => setActiveFilter('all')} className="empty-state-button">
              View All Jobs
            </button>
          </div>
        ) : (
          <div className="jobs-list">
            {filteredJobs.map((job) => (
              <div key={job._id} className="job-card">
                <div className="job-header">
                  <h2 className="job-title">{job.title}</h2>
                  <div className={`status-badge ${getStatusClass(job.status)}`}>
                    {job.status.replace('-', ' ')}
                  </div>
                </div>
                
                <div className="job-details">
                  <div className="job-detail">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14 4H2V12H14V4Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 2V4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 2V4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 6H14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Posted: {formatDate(job.createdAt)}</span>
                  </div>
                  
                  <div className="job-detail">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 4.5V8H11"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Deadline: {formatDate(job.deadline)}</span>
                  </div>
                  
                  <div className="job-detail">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.25 2V14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M11.5 4.5C11.5 4.5 10 2 8.25 2C6.5 2 5 4.5 5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Budget: <strong>${job.budget.toFixed(2)}</strong></span>
                  </div>
                  
                  <div className="job-detail">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 6.5V9.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.5 8H9.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Category: <span className="category-tag">{job.category}</span></span>
                  </div>
                </div>
                
                <p className="job-description">
                  {job.description.length > 150
                    ? `${job.description.substring(0, 150)}...`
                    : job.description}
                </p>
                
                <div className="bid-info">
                  <div className="bid-count">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 14V12C12 10.9391 11.5786 9.92172 10.8284 9.17157C10.0783 8.42143 9.06087 8 8 8H4C2.93913 8 1.92172 8.42143 1.17157 9.17157C0.421427 9.92172 0 10.9391 0 12V14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>
                      {job.bids ? (
                        <strong>{job.bids.length}</strong>
                      ) : (
                        <strong>0</strong>
                      )}{" "}
                      bids received
                    </span>
                  </div>
                  
                  <div className="job-actions">
                    <Link to={`/job/${job._id}`} className="view-btn">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.666748 8.00004C0.666748 8.00004 3.33341 2.66671 8.00008 2.66671C12.6667 2.66671 15.3334 8.00004 15.3334 8.00004C15.3334 8.00004 12.6667 13.3334 8.00008 13.3334C3.33341 13.3334 0.666748 8.00004 0.666748 8.00004Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      View Details
                    </Link>
                    
                    {job.status === "open" && (
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(job._id)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2 4H3.33333H14"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5.33325 4.00002V2.66669C5.33325 2.31306 5.47373 1.9739 5.7238 1.72385C5.97387 1.47378 6.31302 1.33335 6.66659 1.33335H9.33325C9.68682 1.33335 10.026 1.47378 10.276 1.72385C10.5261 1.9739 10.6666 2.31306 10.6666 2.66669V4.00002"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12.6666 4V13.3333C12.6666 13.687 12.5261 14.0261 12.2761 14.2762C12.026 14.5262 11.6868 14.6667 11.3333 14.6667H4.66659C4.31302 14.6667 3.97387 14.5262 3.7238 14.2762C3.47373 14.0261 3.33325 13.687 3.33325 13.3333V4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;