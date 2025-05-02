import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import newRequest from "../../utils/newRequest";
import Review from "../review/Review";
import "./Reviews.scss";

const Reviews = ({ gigId }) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  // Fetch all reviews for this gig
  const { 
    isLoading: reviewsLoading, 
    error: reviewsError, 
    data: reviews 
  } = useQuery({
    queryKey: ["reviews", gigId],
    queryFn: () =>
      newRequest.get(`/reviews/${gigId}`).then((res) => {
        return res.data;
      }),
  });

  // Check if user has purchased this gig
  const { 
    isLoading: purchaseCheckLoading, 
    data: hasPurchased 
  } = useQuery({
    queryKey: ["userPurchasedGig", gigId],
    queryFn: () =>
      newRequest.get(`/orders/check-purchase/${gigId}`).then((res) => {
        return res.data.hasPurchased;
      }),
    // Only run this query if user is logged in and is not a seller
    enabled: !!currentUser && !currentUser.isSeller,
  });

  // Check if user has already reviewed this gig
  const { 
    isLoading: reviewCheckLoading, 
    data: hasReviewed 
  } = useQuery({
    queryKey: ["userReviewedGig", gigId],
    queryFn: () =>
      newRequest.get(`/reviews/check/${gigId}`).then((res) => {
        return res.data.hasReviewed;
      }),
    // Only run this query if user is logged in, not a seller, and has purchased the gig
    enabled: !!currentUser && !currentUser.isSeller && hasPurchased === true,
  });

  const mutation = useMutation({
    mutationFn: (review) => {
      return newRequest.post("/reviews", review);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", gigId]);
      queryClient.invalidateQueries(["userReviewedGig", gigId]);
      setError(null); // Clear any previous errors
    },
    onError: (err) => {
      setError(err.response?.data || "Something went wrong!");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const desc = e.target[0].value;
    const star = e.target[1].value;
    
    if (desc.trim() === "") {
      setError("Please write your review before submitting.");
      return;
    }
    
    mutation.mutate({ gigId, desc, star });
    
    // Reset form
    e.target.reset();
  };

  // Check if loading
  const isLoading = reviewsLoading || purchaseCheckLoading || reviewCheckLoading;

  // Determine if user can review (purchased but hasn't reviewed yet)
  const canReview = currentUser && !currentUser.isSeller && hasPurchased && !hasReviewed;

  return (
    <div className="reviews">
      <h2>Reviews</h2>
      {isLoading ? (
        <div className="loading-reviews">
          <div className="loading-circle"></div>
          <span>Loading reviews...</span>
        </div>
      ) : reviewsError ? (
        <div className="error-message">
          <span>Error loading reviews</span>
        </div>
      ) : (
        <>
          {reviews.length === 0 ? (
            <div className="no-reviews">
              <p>No reviews yet for this service.</p>
            </div>
          ) : (
            reviews.map((review) => <Review key={review._id} review={review} />)
          )}
        </>
      )}

      {/* Only show review form for customers who purchased but haven't reviewed yet */}
      {canReview && (
        <div className="add">
          <h3>Add a review</h3>
          {error && <div className="review-error">{error}</div>}
          <form className="addForm" onSubmit={handleSubmit}>
            <textarea 
              placeholder="Share your experience with this service"
              rows={4}
            />
            <div className="form-bottom">
              <select name="rating">
                <option value={5}>5 ⭐</option>
                <option value={4}>4 ⭐</option>
                <option value={3}>3 ⭐</option>
                <option value={2}>2 ⭐</option>
                <option value={1}>1 ⭐</option>
              </select>
              <button type="submit" disabled={mutation.isLoading}>
                {mutation.isLoading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Only show message if user has purchased and already reviewed */}
      {currentUser && !currentUser.isSeller && hasPurchased && hasReviewed && (
        <div className="review-message">
          <p>You've already submitted a review for this service. Thank you!</p>
        </div>
      )}
    </div>
  );
};

export default Reviews;