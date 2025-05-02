import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import "./JobReviewsDisplay.css";
import newRequest from "../../utils/newRequest";
import moment from "moment";

const JobReviewsDisplay = ({ jobId, filterType }) => {
  // Fetch all reviews for a job
  const { isLoading, error, data: reviews } = useQuery({
    queryKey: ["jobReviews", jobId],
    queryFn: () => newRequest.get(`/job-reviews/job/${jobId}`).then((res) => res.data),
    enabled: !!jobId,
  });

  // Filter reviews based on filterType if provided
  const filteredReviews = filterType
    ? reviews?.filter(review => review.reviewType === filterType)
    : reviews;

  if (isLoading) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  if (error) {
    return (
      <div className="reviews-error">
        Error loading reviews: {error.response?.status === 404 ? "No reviews found" : (error.response?.data || error.message)}
      </div>
    );
  }

  if (!filteredReviews || filteredReviews.length === 0) {
    return (
      <div className="no-reviews">
        <p>No reviews have been submitted for this job yet.</p>
      </div>
    );
  }

  // Render a single review
  const renderReview = (review) => {
    return (
      <div className="job-review-item" key={review._id}>
        <div className="review-header">
          <ReviewerInfo reviewerId={review.reviewerId} />
          <div className="review-rating">
            {Array(review.rating)
              .fill()
              .map((_, i) => (
                <span key={i} className="star-filled">★</span>
              ))}
            {Array(5 - review.rating)
              .fill()
              .map((_, i) => (
                <span key={i} className="star-empty">★</span>
              ))}
          </div>
        </div>
        <div className="review-content">
          <p className="review-text">{review.comment}</p>
          <p className="review-date">
            Posted on {moment(review.createdAt).format("MMMM D, YYYY")}
          </p>
        </div>
      </div>
    );
  };

  // Component to fetch and display reviewer information
  const ReviewerInfo = ({ reviewerId }) => {
    const { isLoading, error, data: reviewer } = useQuery({
      queryKey: ["user", reviewerId],
      queryFn: () => newRequest.get(`/users/${reviewerId}`).then((res) => res.data),
      enabled: !!reviewerId,
    });

    if (isLoading) return <span>Loading user...</span>;
    if (error) return <span>Unknown user</span>;

    const profileLink = `/profile/${reviewerId}` 
    return (
      <div className="reviewer-info">
        <Link to={profileLink} className="reviewer-link">
          <img 
            src={reviewer.img || "/img/noavatar.jpg"} 
            alt={reviewer.username}
            className="reviewer-avatar"
          />
          <div className="reviewer-details">
            <span className="reviewer-name">{reviewer.username}</span>
            <span className="reviewer-type">
              {reviewer.isSeller ? "Freelancer" : "Client"}
            </span>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className="reviews-list">
      {filteredReviews.map(renderReview)}
    </div>
  );
};
export default JobReviewsDisplay;
