import React, { useEffect, useState } from "react";
import "./CheckoutForm.css";
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const CheckoutForm = ({ successUrl = "http://localhost:5173/success" }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage({ text: "Payment succeeded!", type: "success" });
          break;
        case "processing":
          setMessage({ text: "Your payment is processing.", type: "info" });
          break;
        case "requires_payment_method":
          setMessage({ 
            text: "Your payment was not successful, please try again.", 
            type: "error" 
          });
          break;
        default:
          setMessage({ text: "Something went wrong.", type: "error" });
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: successUrl,
      },
    });

    if (error) {
      setMessage({ 
        text: error.message, 
        type: error.type === "card_error" || error.type === "validation_error" 
          ? "error" 
          : "info" 
      });
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
  };

  const handleLinkAuthentication = (e) => {
    if (e?.value) setEmail(e.value);
  };

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <header className="checkout-header">
          <h2>Complete Your Payment</h2>
          <p>Secured by Stripe</p>
        </header>

        <form id="payment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <LinkAuthenticationElement
              id="link-authentication-element"
              onChange={handleLinkAuthentication}
            />
          </div>

          <div className="form-group">
            <PaymentElement id="payment-element" options={paymentElementOptions} />
          </div>

          <button 
            disabled={isLoading || !stripe || !elements} 
            id="submit"
            className="payment-button"
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <span>Pay Now</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>

          {message && (
            <div className={`payment-message ${message.type}`}>
              {message.text}
            </div>
          )}
        </form>

        <footer className="checkout-footer">
          <div className="security-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Secure Payment</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CheckoutForm;