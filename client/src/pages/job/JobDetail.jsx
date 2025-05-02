import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import emailjs from "@emailjs/browser";
import newRequest from "../../utils/newRequest";
import JobAd from "../../components/jobAd/JobAd"; // Import the JobAd component
import "./JobDetail.css";

const JobDetail = () => {
  // All your existing state variables
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [bidFormOpen, setBidFormOpen] = useState(false);
  const [bidData, setBidData] = useState({
    price: "",
    deliveryDate: "",
    message: "",
  });
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Calculate minimum delivery date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDeliveryDate = tomorrow.toISOString().split("T")[0];

  // Fetch job details
  const {
    isLoading,
    error,
    data: job,
  } = useQuery({
    queryKey: ["job", id],
    queryFn: () => newRequest.get(`/jobs/single/${id}`).then((res) => res.data),
  });

  // Fetch client/buyer data
  const {
    isLoading: isLoadingBuyer,
    error: errorBuyer,
    data: buyerData,
  } = useQuery({
    queryKey: ["user", job?.userId],
    queryFn: () =>
      newRequest.get(`/users/${job.userId}`).then((res) => {
        return res.data;
      }),
    enabled: !!job?.userId,
  });

  // Format the date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  // Helper function to calculate delivery time in days
  const calculateDeliveryDays = (deliveryDate) => {
    if (!deliveryDate) return 0;

    const today = new Date();
    const delivery = new Date(deliveryDate);
    const timeDiff = delivery.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  // Handle bid form change
  const handleBidChange = (e) => {
    const { name, value } = e.target;
    setBidData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit bid
  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setBidLoading(true);
    setBidError(null);

    try {
      // Validate form data
      if (!bidData.price || !bidData.deliveryDate || !bidData.message) {
        throw new Error("Please fill in all fields");
      }

      // Check if already bid
      const alreadyBid = job.bids?.some(
        (bid) => bid.sellerId === currentUser._id
      );
      if (alreadyBid) {
        throw new Error("You have already submitted a proposal for this job");
      }

      // Calculate delivery time in days from the selected date
      const deliveryTimeInDays = calculateDeliveryDays(bidData.deliveryDate);

      if (deliveryTimeInDays <= 0) {
        throw new Error("Delivery date must be in the future");
      }

      // Prepare data
      const bidPayload = {
        price: parseFloat(bidData.price),
        deliveryTime: deliveryTimeInDays,
        message: bidData.message,
      };

      // Send the bid
      await newRequest.post(`/jobs/bid/${id}`, bidPayload);

      setBidSuccess(true);
      setBidFormOpen(false);

      // Refresh job data to show the new bid
      queryClient.invalidateQueries(["job", id]);

      // Reset form
      setBidData({
        price: "",
        deliveryDate: "",
        message: "",
      });
    } catch (err) {
      console.error("Error submitting bid:", err);
      setBidError(
        err.response?.data || err.message || "Failed to submit proposal"
      );
    } finally {
      setBidLoading(false);
    }
  };

  // Handle accepting a bid (for job owner)
  const handleAcceptBid = async (jobId, bidId) => {
    try {
      setEmailSending(true);
      setEmailError(null);

      // First, accept the bid in the backend
      await newRequest.put(`/jobs/accept/${jobId}/${bidId}`);

      // Get the necessary data for the email
      const acceptedBid = job.bids.find((bid) => bid._id === bidId);

      if (!acceptedBid) {
        throw new Error("Could not find the accepted bid");
      }

      // Get freelancer details
      const freelancerResponse = await newRequest.get(
        `/users/${acceptedBid.sellerId}`
      );
      const freelancer = freelancerResponse.data;

      if (!freelancer || !freelancer.email) {
        throw new Error("Freelancer email information is missing");
      }

      // Ensure client data is valid
      if (!buyerData || !buyerData.email) {
        throw new Error("Client email information is missing");
      }

      // Format the delivery date
      const deliveryDate = new Date();
      deliveryDate.setDate(
        deliveryDate.getDate() + parseInt(acceptedBid.deliveryTime)
      );
      const formattedDeliveryDate = formatDate(deliveryDate);

      // Send email to client
      const emailToClient = {
        client_name: buyerData.username,
        freelancer_name: freelancer.username,
        job_title: job.title,
        proposal_price: acceptedBid.price.toFixed(2),
        proposal_delivery_date: formattedDeliveryDate,
        proposal_description: acceptedBid.message,
        to_email: buyerData.email,
      };

      console.log("Sending email to client:", emailToClient);
      await emailjs.send(
        "service_2apk9q6",
        "template_jxft9w2",
        emailToClient,
        "eduEYfdhsVPMyKE3d"
      );

      // Send email to freelancer
      const emailToFreelancer = {
        client_name: buyerData.username,
        freelancer_name: freelancer.username,
        job_title: job.title,
        proposal_price: acceptedBid.price.toFixed(2),
        proposal_delivery_date: formattedDeliveryDate,
        proposal_description: acceptedBid.message,
        to_email: freelancer.email,
      };

      console.log("Sending email to freelancer:", emailToFreelancer);
      await emailjs.send(
        "service_2apk9q6",
        "template_jxft9w2",
        emailToFreelancer,
        "eduEYfdhsVPMyKE3d"
      );

      setEmailSuccess(true);

      // Refresh job data to show the updated status
      queryClient.invalidateQueries(["job", id]);

      // Show success message to user
      alert(
        "Proposal accepted successfully! Both you and the freelancer have been notified via email."
      );
    } catch (err) {
      console.error("Error accepting bid or sending email:", err);
      setEmailError(err.message || "Error accepting proposal");
      alert(
        err.response?.data || "Error accepting proposal. Please try again."
      );
    } finally {
      setEmailSending(false);
    }
  };

  // Handle marking job as complete (for job owner)
  const handleCompleteJob = async (jobId) => {
    try {
      // Find the accepted bid to get payment information
      const acceptedBid = job.bids.find((bid) => bid.status === "accepted");

      if (!acceptedBid) {
        throw new Error("No accepted bid found for this job");
      }

      // Navigate to the payment page with the job ID and accepted bid ID
      navigate(`/job-payment/${jobId}/${acceptedBid._id}`);
    } catch (err) {
      console.error("Error completing job:", err);
      alert(err.message || "Error completing job");
    }
  };

  // Handle messaging the freelancer (for job owner)
  const handleMessageFreelancer = async (jobId) => {
    try {
      // Find the accepted bid to get the seller ID
      const acceptedBid = job.bids.find((bid) => bid.status === "accepted");

      if (!acceptedBid) {
        throw new Error("No accepted bid found for this job");
      }

      const sellerId = acceptedBid.sellerId;
      const buyerId = job.userId;
      const id = sellerId + buyerId;

      try {
        // Check if a conversation already exists
        const res = await newRequest.get(`/conversations/single/${id}`);
        navigate(`/message/${res.data.id}`);
      } catch (err) {
        if (err.response?.status === 404) {
          // Create a new conversation
          const res = await newRequest.post(`/conversations/`, {
            to: sellerId,
          });
          navigate(`/message/${res.data.id}`);
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error("Error messaging freelancer:", err);
      alert(err.response?.data || err.message || "Error messaging freelancer");
    }
  };

  // Function to check if user has already bid
  const hasUserBid = () => {
    return job?.bids?.some((bid) => bid.sellerId === currentUser?._id);
  };

  // Function to get user's bid if they've made one
  const getUserBid = () => {
    return job?.bids?.find((bid) => bid.sellerId === currentUser?._id);
  };

  // Check if the current user is the job owner
  const isJobOwner = job && currentUser && job.userId === currentUser._id;

  // Helper function to display delivery date from days
  const getDeliveryDateFromDays = (days) => {
    if (!days) return "-";
    const date = new Date();
    date.setDate(date.getDate() + parseInt(days));
    return formatDate(date);
  };

  // SellerInfo component for bids
  const SellerInfo = ({ sellerId }) => {
    const {
      isLoading,
      error,
      data: seller,
    } = useQuery({
      queryKey: ["user", sellerId],
      queryFn: () =>
        newRequest.get(`/users/${sellerId}`).then((res) => res.data),
      enabled: !!sellerId,
    });

    if (isLoading)
      return <span className="seller-name">Loading seller info...</span>;
    if (error)
      return (
        <span className="seller-name">Seller #{sellerId.substring(0, 8)}</span>
      );

    return (
      <Link to={`/profile/${sellerId}`} className="seller-profile-link">
        <div className="seller-avatar-wrapper">
          <img
            src={seller.img || "/img/noavatar.jpg"}
            alt={seller.username}
            className="seller-avatar"
          />
        </div>
        <div className="seller-details">
          <span className="seller-name">{seller.username}</span>
          {seller.totalRating > 0 && (
            <span className="seller-rating">
              <span className="star-icon">★</span>
              {seller.totalRating.toFixed(1)} ({seller.reviewCount})
            </span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="job-detail-container">
      
      <div className="job-detail-wrapper">
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading job details...</p>
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
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M12 7V13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
            <p>{error}</p>
            <button className="back-btn" onClick={() => navigate("/jobs")}>
              Back to Jobs
            </button>
          </div>
        ) : job ? (
          <>
            <div className="job-detail-header">
              <div className="breadcrumbs">
                <Link to="/jobs">Jobs</Link>
                <span className="separator">/</span>
                <span className="current">{job.title}</span>
              </div>

              <div className="job-title-section">
                <h1 className="job-title">{job.title}</h1>

                {/* Client info section */}
                <div className="job-client-info">
                  {isLoadingBuyer ? (
                    <div className="client-loading">
                      Loading client profile...
                    </div>
                  ) : errorBuyer ? (
                    <div className="client-error">
                      Client profile unavailable
                    </div>
                  ) : (
                    <Link
                      to={`/profile/${job.userId}`}
                      className="client-profile-link"
                    >
                      <img
                        src={buyerData?.img || "/img/noavatar.jpg"}
                        alt={buyerData?.username}
                        className="client-avatar"
                      />
                      <div className="client-details">
                        <span className="client-name">
                          {buyerData?.username || "Client"}
                        </span>
                        <span className="client-location">
                          {buyerData?.country || "Location unavailable"}
                        </span>
                      </div>
                    </Link>
                  )}
                </div>

                <div className="job-meta">
                  <span className="category-tag">{job.category}</span>
                  <span className="job-time">{formatDate(job.createdAt)}</span>
                  <span className={`status-badge status-${job.status}`}>
                    {job.status.replace("-", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="job-detail-content">
              <div className="job-main-content">
                <div className="job-description-section">
                  <h2>Job Description</h2>
                  <p className="job-description">{job.description}</p>
                </div>


                {currentUser?.isSeller &&
                  job.status === "open" &&
                  !isJobOwner && (
                    <div className="bid-section">
                      {bidSuccess ? (
                        <div className="success-message">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M8 12L10.5 14.5L16 9"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p>Your proposal has been submitted successfully!</p>
                        </div>
                      ) : hasUserBid() ? (
                        <div className="user-bid-info">
                          <h3>Your Proposal</h3>
                          <div className="user-bid-details">
                            <div className="detail-item">
                              <span className="detail-label">Your Bid:</span>
                              <span className="detail-value">
                                ${getUserBid().price.toFixed(2)}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">
                                Delivery Date:
                              </span>
                              <span className="detail-value">
                                {getDeliveryDateFromDays(
                                  getUserBid().deliveryTime
                                )}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Status:</span>
                              <span
                                className={`bid-status ${getUserBid().status}`}
                              >
                                {getUserBid().status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {bidFormOpen ? (
                            <div className="bid-form-container">
                              <h3>Submit a Proposal</h3>
                              {bidError && (
                                <div className="error-message">
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <circle
                                      cx="8"
                                      cy="8"
                                      r="7"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                    />
                                    <path
                                      d="M8 4V8"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                    />
                                    <circle
                                      cx="8"
                                      cy="11"
                                      r="0.5"
                                      fill="currentColor"
                                    />
                                  </svg>
                                  <span>{bidError}</span>
                                </div>
                              )}

                              <form onSubmit={handleBidSubmit}>
                                <div className="form-group">
                                  <label htmlFor="price">Bid Amount ($)</label>
                                  <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={bidData.price}
                                    onChange={handleBidChange}
                                    min="1"
                                    step="0.01"
                                    required
                                    placeholder="Enter your bid amount"
                                  />
                                  <small className="budget-info">
                                    Client's budget: ${job.budget.toFixed(2)}
                                  </small>
                                </div>

                                <div className="form-group">
                                  <label htmlFor="deliveryDate">
                                    Delivery Date
                                  </label>
                                  <input
                                    type="date"
                                    id="deliveryDate"
                                    name="deliveryDate"
                                    value={bidData.deliveryDate}
                                    onChange={handleBidChange}
                                    min={minDeliveryDate}
                                    max={job.deadline}
                                    required
                                    placeholder="Select delivery date"
                                  />
                                  <small className="budget-info">
                                    Job deadline: {formatDate(job.deadline)}
                                  </small>
                                </div>

                                <div className="form-group">
                                  <label htmlFor="message">Cover Letter</label>
                                  <textarea
                                    id="message"
                                    name="message"
                                    value={bidData.message}
                                    onChange={handleBidChange}
                                    rows="6"
                                    required
                                    placeholder="Explain why you're the best fit for this job..."
                                  ></textarea>
                                </div>

                                <div className="bid-form-actions">
                                  <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setBidFormOpen(false)}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={bidLoading}
                                  >
                                    {bidLoading ? (
                                      <>
                                        <span className="spinner-small"></span>
                                        Submitting...
                                      </>
                                    ) : (
                                      "Submit Proposal"
                                    )}
                                  </button>
                                </div>
                              </form>
                            </div>
                          ) : (
                            <button
                              className="bid-btn"
                              onClick={() => setBidFormOpen(true)}
                            >
                              Submit a Proposal
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                {isJobOwner && job.bids && job.bids.length > 0 && (
                  <div className="proposals-section">
                    <h2>Proposals ({job.bids.length})</h2>

                    <div className="proposals-list">
                      {job.bids.map((bid) => (
                        <div
                          key={bid._id}
                          className={`proposal-card ${
                            bid.status === "accepted" ? "accepted" : ""
                          }`}
                        >
                          <div className="proposal-header">
                            <div className="seller-info">
                              <SellerInfo sellerId={bid.sellerId} />
                              <span className={`proposal-status ${bid.status}`}>
                                {bid.status}
                              </span>
                            </div>
                            <div className="proposal-price">
                              ${bid.price.toFixed(2)}
                            </div>
                          </div>

                          <div className="proposal-details">
                            <div className="detail-item">
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
                              <span>
                                Will deliver by{" "}
                                {getDeliveryDateFromDays(bid.deliveryTime)}
                              </span>
                            </div>
                            <div className="detail-item">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14 4H2V12H3.5L2 13.5V4Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M2 4H14V12H12.5L14 13.5V4Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span>Submitted {formatDate(bid.createdAt)}</span>
                            </div>
                          </div>

                          <div className="proposal-message">
                            <h4>Cover Letter</h4>
                            <p>{bid.message}</p>
                          </div>

                          {job.status === "open" && (
                            <div className="proposal-actions">
                              <button
                                className="accept-btn"
                                onClick={() =>
                                  handleAcceptBid(job._id, bid._id)
                                }
                                disabled={job.status !== "open" || emailSending}
                              >
                                {emailSending ? (
                                  <>
                                    <span className="spinner-small"></span>
                                    Processing...
                                  </>
                                ) : (
                                  "Accept Proposal"
                                )}
                              </button>

                              {emailError && (
                                <div className="email-error">
                                  Failed to send notification: {emailError}
                                </div>
                              )}

                              {emailSuccess && (
                                <div className="email-success">
                                  Notification emails sent successfully!
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isJobOwner && job.status === "in-progress" && (
                  <div className="job-actions">
                    <button
                      className="complete-job-btn"
                      onClick={() => handleCompleteJob(job._id)}
                    >
                      Mark as Completed
                    </button>
                    <button
                      className="message-freelancer-btn"
                      onClick={() => handleMessageFreelancer(job._id)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 4H14V12H3.5L2 13.5V4Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5 7H11"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5 9H9"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Message Freelancer
                    </button>
                  </div>
                )}
              </div>

              <div className="job-sidebar">
              {job.category && <JobAd category={job.category} />}
                <div className="job-details-card">
                  <h3>Job Details</h3>

                  <div className="details-list">
                    <div className="detail-item">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 5.625V10H14.375"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="detail-content">
                        <span className="detail-label">Deadline</span>
                        <span className="detail-value">
                          {formatDate(job.deadline)}
                        </span>
                        <span className="detail-info">
                          {calculateRemainingDays(job.deadline)} remaining
                        </span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12.5 8.125C12.5 8.125 11.2812 6.25 9.99999 6.25C8.71874 6.25 7.5 8.125 7.5 8.125"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.5 11.875C7.5 11.875 8.71875 13.75 10 13.75C11.2812 13.75 12.5 11.875 12.5 11.875"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="detail-content">
                        <span className="detail-label">Budget</span>
                        <span className="detail-value">
                          ${job.budget.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15 17.5V15.8333C15 14.9493 14.6839 14.1014 14.1213 13.4763C13.5587 12.8512 12.7956 12.5 12 12.5H8C7.20435 12.5 6.44129 12.8512 5.87868 13.4763C5.31607 14.1014 5 14.9493 5 15.8333V17.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 9.16667C11.6569 9.16667 13 7.82359 13 6.16667C13 4.50974 11.6569 3.16667 10 3.16667C8.34315 3.16667 7 4.50974 7 6.16667C7 7.82359 8.34315 9.16667 10 9.16667Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="detail-content">
                        <span className="detail-label">Proposals</span>
                        <span className="detail-value">
                          {job.bids?.length || 0} received
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bid on this job button/form for sellers */}

              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default JobDetail;