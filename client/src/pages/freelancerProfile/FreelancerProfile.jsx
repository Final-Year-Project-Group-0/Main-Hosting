import React, { useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import "./FreelancerProfile.scss";
import moment from "moment";
import { ThemeContext } from "../../App";
import JobReviewsDisplay from "../../components/jobReview/JobReviewsDisplay";

function FreelancerProfile() {
  const { userId } = useParams();
  const { darkMode } = useContext(ThemeContext);

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

  // Fetch user's gigs
  const { 
    isLoading: isLoadingGigs, 
    error: errorGigs, 
    data: gigsData 
  } = useQuery({
    queryKey: ["userGigs", userId],
    queryFn: () => newRequest.get(`/gigs?userId=${userId}`).then((res) => res.data),
    refetchOnWindowFocus: false,
    enabled: !!userId && userData?.isSeller,
  });

  // Fetch completed jobs where this user is the seller
  const { 
    isLoading: isLoadingJobs, 
    error: errorJobs, 
    data: jobsData 
  } = useQuery({
    queryKey: ["sellerJobs", userId],
    queryFn: async () => {
      // Find jobs where this seller's bid was accepted and job is completed
      const response = await newRequest.get(`/jobs?status=completed`);
      return response.data.filter(job => {
        const acceptedBid = job.bids?.find(bid => bid.status === "accepted");
        return acceptedBid && acceptedBid.sellerId === userId;
      });
    },
    refetchOnWindowFocus: false,
    enabled: !!userId && userData?.isSeller,
  });

  if (isLoadingUser) {
    return <div className="loading-container">Loading freelancer profile...</div>;
  }

  if (errorUser) {
    return <div className="error-container">Error loading freelancer profile</div>;
  }

  return (
    <div className={`freelancer-profile-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="freelancer-profile">
        <div className="profile-section">
          <div className="profile-header">
            <div className="profile-cover"></div>
            <div className="profile-info">
              <div className="profile-avatar">
                <img src={userData.img || "/img/noavatar.jpg"} alt={userData.username} />
              </div>
              <div className="profile-details">
                <h1>{userData.username}</h1>
                {userData.isSeller && <div className="user-type">Freelancer</div>}
                <div className="location">
                  <i className="fa fa-map-marker" aria-hidden="true"></i> {userData.country}
                </div>
                <div className="member-since">
                  Member since {moment(userData.createdAt).format("MMMM YYYY")}
                </div>
                {userData.totalRating > 0 && (
                  <div className="user-rating">
                    <span className="star-icon">★</span> 
                    <span className="rating-value">{userData.totalRating.toFixed(1)}</span>
                    <span className="review-count">({userData.reviewCount} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="profile-body">
            <div className="about-section">
              <h2>About</h2>
              <p>{userData.desc || "No description provided."}</p>
            </div>

            {userData.isSeller && userData.skills && (
              <div className="skills-section">
                <h2>Skills</h2>
                <div className="skills-list">
                  {userData.skills.split(',')
                    .filter(skill => skill.trim() !== '')
                    .map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill.trim()}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {userData.isSeller && userData.certifications && userData.certifications.length > 0 && (
              <div className="certifications-section">
                <h2>Certifications</h2>
                <div className="certifications-list">
                  {userData.certifications.map((cert, index) => (
                    <a 
                      href={cert} 
                      key={index} 
                      className="certification-link" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <i className="fa fa-certificate"></i>
                      <span>View Certificate {index + 1}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {userData.isSeller && (
          <>
            <div className="gigs-section">
              <h2>Services by {userData.username}</h2>
              
              {isLoadingGigs ? (
                <div className="loading-gigs">Loading services...</div>
              ) : errorGigs ? (
                <div className="error-gigs">Failed to load services</div>
              ) : (
                <div className="gigs-grid">
                  {gigsData && gigsData.length > 0 ? (
                    gigsData.map((gig) => (
                      <div className="gig-card" key={gig._id}>
                        <Link to={`/gig/${gig._id}`} className="link">
                          <div className="gig-img">
                            <img src={gig.cover} alt={gig.title} />
                          </div>
                          <div className="gig-content">
                            <h3>{gig.title}</h3>
                            <div className="gig-price">
                              <span className="label">Starting at</span>
                              <span className="price">${gig.price}</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="no-gigs">
                      <p>No services available from this freelancer yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Completed Jobs Section */}
            {isLoadingJobs ? (
              <div className="loading-jobs">Loading job history...</div>
            ) : errorJobs ? (
              <div className="error-jobs">Failed to load job history</div>
            ) : jobsData && jobsData.length > 0 ? (
              <div className="completed-jobs-section">
                <h2>Completed Projects</h2>
                <div className="completed-jobs-list">
                  {jobsData.map(job => (
                    <div key={job._id} className="completed-job-card">
                      <h3 className="job-title">{job.title}</h3>
                      <div className="job-details">
                        <span className="job-category">{job.category}</span>
                        <span className="job-completion-date">
                          Completed on {moment(job.completedAt || job.updatedAt).format("MMMM D, YYYY")}
                        </span>
                      </div>
                      <p className="job-description">{job.description}</p>
                      
                      <div className="job-reviews">
                        <h4>Client's Feedback</h4>
                        <JobReviewsDisplay jobId={job._id} filterType="seller" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}

        <div className="contact-section">
          <Link to={`/`} className="back-btn">
            <i className="fa fa-arrow-left"></i> Back to Homepage
          </Link>
          
          {userData.isSeller && (
            <a href={`mailto:${userData.email}`} className="contact-btn">
              <i className="fa fa-envelope"></i> Contact Freelancer
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default FreelancerProfile;