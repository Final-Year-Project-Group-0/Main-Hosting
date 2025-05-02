import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import "./ClientProfile.scss";
import moment from "moment";
import JobReviewsDisplay from "../../components/jobReview/JobReviewsDisplay";

function ClientProfile() {
  const { userId } = useParams();
  
  // Fetch user data
  const { 
    isLoading: isLoadingUser, 
    error: errorUser, 
    data: userData 
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => newRequest.get(`/users/${userId}`).then((res) => res.data),
    refetchOnWindowFocus: false,
  });

  // Fetch jobs posted by this user
  const { 
    isLoading: isLoadingJobs, 
    error: errorJobs, 
    data: jobsData 
  } = useQuery({
    queryKey: ["userJobs", userId],
    queryFn: () => newRequest.get(`/jobs?userId=${userId}`).then((res) => res.data),
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });

  if (isLoadingUser) {
    return <div className="loading-container">Loading client profile...</div>;
  }

  if (errorUser) {
    return <div className="error-container">Error loading client profile</div>;
  }

  // Filter jobs that have been completed
  const completedJobs = jobsData?.filter(job => job.status === "completed") || [];

  return (
    <div className="client-profile-container">
      <div className="client-profile">
        <div className="profile-section">
          <div className="profile-header">
            <div className="profile-cover"></div>
            <div className="profile-info">
              <div className="profile-avatar">
                <img src={userData.img || "/img/noavatar.jpg"} alt={userData.username} />
              </div>
              <div className="profile-details">
                <h1>{userData.username}</h1>
                <div className="user-type">Client</div>
                <div className="location">
                  <i className="fa fa-map-marker" aria-hidden="true"></i> {userData.country}
                </div>
                <div className="member-since">
                  Member since {moment(userData.createdAt).format("MMMM YYYY")}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-body">
            <div className="about-section">
              <h2>About</h2>
              <p>{userData.desc || "No description provided."}</p>
            </div>

            {isLoadingJobs ? (
              <div className="loading-jobs">Loading job history...</div>
            ) : errorJobs ? (
              <div className="error-jobs">Failed to load job history</div>
            ) : (
              <>
                <div className="job-history-section">
                  <h2>Job History</h2>
                  {jobsData && jobsData.length > 0 ? (
                    <div className="job-stats">
                      <div className="stat-box">
                        <div className="stat-number">{jobsData.length}</div>
                        <div className="stat-label">Total Jobs Posted</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-number">{completedJobs.length}</div>
                        <div className="stat-label">Completed Jobs</div>
                      </div>
                    </div>
                  ) : (
                    <p className="no-jobs">No jobs posted yet.</p>
                  )}
                </div>

                {completedJobs.length > 0 && (
                  <div className="reviews-section">
                    <h2>Job Reviews</h2>
                    <p className="review-intro">
                      Reviews from freelancers who have worked with {userData.username}
                    </p>
                    
                    <div className="job-reviews-list">
                      {completedJobs.map(job => (
                        <div key={job._id} className="job-review-container">
                          <h3 className="job-title">{job.title}</h3>
                          <JobReviewsDisplay jobId={job._id} filterType="client" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="contact-section">
          <Link to={`/`} className="back-btn">
            <i className="fa fa-arrow-left"></i> Back to Homepage
          </Link>
          
          <a href={`mailto:${userData.email}`} className="contact-btn">
            <i className="fa fa-envelope"></i> Contact Client
          </a>
        </div>
      </div>
    </div>
  );
}

export default ClientProfile;