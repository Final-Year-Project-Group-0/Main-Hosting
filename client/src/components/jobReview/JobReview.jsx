import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import "./JobReview.css";

const JobReview = ({ jobId, reviewType = "client" }) => {
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  // State for the review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  
  // Fetch job details to get the other party's ID
  const { isLoading: jobLoading, data: jobData } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => newRequest.get(`/jobs/single/${jobId}`).then((res) => res.data),
    enabled: !!jobId,
  });

  // Check if the user has already reviewed this job
  const { isLoading: reviewsLoading, data: reviewsData } = useQuery({
    queryKey: ["job-reviews", jobId],
    queryFn: () => newRequest.get(`/job-reviews/job/${jobId}`).then((res) => res.data),
    enabled: !!jobId,
    onSuccess: (data) => {
      if (data && Array.isArray(data)) {
        // Check if the current user has already submitted a review
        const hasReviewed = data.some(
          (review) => review.reviewerId === currentUser._id && review.reviewType === reviewType
        );
        setAlreadyReviewed(hasReviewed);
        
        // If they've already reviewed, find and set their previous review values
        if (hasReviewed) {
          const userReview = data.find(
            (review) => review.reviewerId === currentUser._id && review.reviewType === reviewType
          );
          if (userReview) {
            setRating(userReview.rating);
            setComment(userReview.comment);
          }
        }
      }
    },
    onError: (err) => {
      console.error("Error fetching reviews:", err);
      // If we get a 404, it likely means no reviews exist yet
      if (err.response && err.response.status === 404) {
        setAlreadyReviewed(false);
      }
    }
  });

  // Determine who is being reviewed based on job data
  const getReviewedId = () => {
    if (!jobData) return null;
    
    // For client reviews, the freelancer (seller) is reviewing the client
    if (reviewType === "client" && currentUser.isSeller) {
      return jobData.userId; // Reviewing the client/buyer
    } 
    // For seller reviews, the client (buyer) is reviewing the freelancer
    else if (reviewType === "seller" && !currentUser.isSeller) {
      // Find the accepted bidder's ID
      const acceptedBid = jobData.bids?.find(bid => bid.status === "accepted");
      return acceptedBid ? acceptedBid.sellerId : null;
    }
    
    return null;
  };

  // Mutation to submit the review
  const mutation = useMutation({
    mutationFn: (reviewData) => {
      // Make sure we're using the correct endpoint
      return newRequest.post("/job-reviews", reviewData);
    },
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      // Reset form
      setRating(5);
      setComment("");
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(["job-reviews", jobId]);
      
      // Also invalidate user data to update ratings
      const reviewedId = getReviewedId();
      if (reviewedId) {
        queryClient.invalidateQueries(["user", reviewedId]);
      }
    },
    onError: (err) => {
      console.error("Review submission error:", err);
      setError(err.response?.data || "Failed to submit review. Please try again.");
      setSuccess(false);
    }
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars");
      return;
    }
    
    if (!comment.trim()) {
      setError("Please provide a comment");
      return;
    }
    
    const reviewedId = getReviewedId();
    if (!reviewedId) {
      setError("Could not determine who to review");
      return;
    }
    
    // Submit the review
    const reviewData = {
      jobId,
      reviewedId,
      rating,
      reviewType,
      comment,
      isPublic: true
    };
    
    // Send the review to the backend
    mutation.mutate(reviewData);
  };

  if (jobLoading) {
    return <div className="review-loading">Loading review form...</div>;
  }

  if (!jobData) {
    return <div className="review-error">Error loading job details</div>;
  }

  // Check if the job is completed
  if (jobData.status !== "completed") {
    return (
      <div className="review-not-ready">
        <p>You can submit a review once the job is completed</p>
      </div>
    );
  }

  return (
    <div className="job-review-container">
      <h3>
        {reviewType === "client" 
          ? "Rate the Client" 
          : "Rate the Freelancer"}
      </h3>
      
      {alreadyReviewed && !success ? (
        <div className="already-reviewed">
          <p>You've already submitted a review for this job.</p>
          <p>Your rating: {rating} stars</p>
          <p>Your comment: "{comment}"</p>
        </div>
      ) : success ? (
        <div className="review-success">
          <p>Thank you for your review!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div className="review-error">{error}</div>}
          
          <div className="rating-input">
            <label>Your Rating:</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= rating ? "star filled" : "star"}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          
          <div className="comment-input">
            <label>Your Review:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share your experience working with this ${reviewType === "client" ? "client" : "freelancer"}...`}
              rows="4"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-review" 
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
};

export default JobReview;