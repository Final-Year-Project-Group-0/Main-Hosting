import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import newRequest from "../../utils/newRequest";

const JobPaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        // Get the payment_intent from the URL
        const searchParams = new URLSearchParams(location.search);
        const paymentIntent = searchParams.get("payment_intent");
        
        if (!paymentIntent) {
          throw new Error("No payment information found");
        }
        
        // Confirm the payment and complete the job
        await newRequest.post("/jobs/payment-confirm", {
          payment_intent: paymentIntent
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error confirming payment:", err);
        setError(err.response?.data || "Error confirming payment");
        setLoading(false);
      }
    };
    
    confirmPayment();
  }, [location]);

  if (loading) {
    return (
      <div className="success-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Finalizing your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="success-container">
        <div className="error-message">
          <p>{error}</p>
          <Link to="/myjobs" className="back-link">Go back to my jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="success-container">
      <div className="success-content">
        <div className="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
            <path d="M7 13L10 16L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1>Payment Successful!</h1>
        <p>Your job has been marked as completed and the payment has been processed.</p>
        <div className="success-actions">
          <Link to="/myjobs" className="back-to-jobs">View My Jobs</Link>
        </div>
      </div>
    </div>
  );
};

export default JobPaymentSuccess;