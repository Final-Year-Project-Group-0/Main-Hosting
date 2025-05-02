import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import newRequest from "../../utils/newRequest";
import { useParams } from "react-router-dom";
import CheckoutForm from "../../components/checkoutForm/CheckoutForm";

const stripePromise = loadStripe(
  "pk_test_51R6DmDK5PsIRPbW5oXkRRZ33z6WYnUEF3YUmumj38YG4RGvPLqNCaV7FDws0xnL1h6oCnEaHLTXAM0Xn1c10jPjB000BaVx8nJ"
);

const JobPayment = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { jobId, bidId } = useParams();

  useEffect(() => {
    const makeRequest = async () => {
      try {
        setLoading(true);
        // Create a payment intent specifically for job payments
        const res = await newRequest.post(
          `/jobs/payment/${jobId}/${bidId}`
        );
        setClientSecret(res.data.clientSecret);
      } catch (err) {
        console.error("Error creating payment intent:", err);
        setError(err.response?.data || "Error creating payment");
      } finally {
        setLoading(false);
      }
    };
    makeRequest();
  }, [jobId, bidId]);

  const appearance = {
    theme: 'stripe',
  };
  
  const options = {
    clientSecret,
    appearance,
  };

  if (loading) {
    return (
      <div className="payment-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Preparing payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-container">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>Complete Your Job Payment</h1>
        <p>Your payment is securely processed by Stripe</p>
      </div>
      {clientSecret ? (
        <div className="payment-form-wrapper">
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm successUrl="http://localhost:5173/job-payment-success" />
          </Elements>
        </div>
      ) : (
        <p>Loading payment form...</p>
      )}
    </div>
  );
};

export default JobPayment;