import React from "react";
import "./whyfreelancify.css";

const WhyFreelancify = () => {
  return (
    <section className="why-section">
      <div className="container">
        <h2>Why Freelancify</h2>
        <p className="section-description">
          We connect talented freelancers with clients worldwide, creating a trusted marketplace where quality work and fair opportunities thrive.
        </p>

        {/* Features Grid - First Row */}
        <div className="features-grid">
          {/* Card 1 */}
          <div className="feature-card">
            <div className="icon-container">
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Find Top Freelancers Easily</h3>
            <p>
              Discover skilled professionals across various fields, ready to work on your projects.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <div className="icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3>Guaranteed Payment Security</h3>
            <p>
              Every transaction is encrypted and protected, ensuring trust between freelancers and clients.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <div className="icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </div>
            <h3>Trusted Community</h3>
            <p>
              A platform designed to bring clients and freelancers together for quality collaborations.
            </p>
          </div>
        </div>

        {/* Features Grid - Second Row */}
        <div className="features-grid">
          {/* Card 4 */}
          <div className="feature-card">
            <div className="icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>Effortless Project Management</h3>
            <p>
              Communicate, share files, and track progress—all in one place.
            </p>
          </div>

          {/* Card 5 */}
          <div className="feature-card">
            <div className="icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h3>Flexible Work Opportunities</h3>
            <p>
              Hire or work on projects that fit your schedule, whether it's a one-time gig or a long-term collaboration.
            </p>
          </div>

          {/* Card 6 */}
          <div className="feature-card">
            <div className="icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h3>Diverse Skill Marketplace</h3>
            <p>
              Access professionals across design, development, writing, marketing, and more, all in one platform.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="cta-buttons">
          <a href="#" className="primary-btn">
            Browse Freelancers
          </a>
          <a href="#" className="secondary-btn">
            Learn How It Works
          </a>
        </div>
      </div>
    </section>
  );
};

export default WhyFreelancify;