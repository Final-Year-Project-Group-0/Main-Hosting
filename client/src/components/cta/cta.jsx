import React from 'react';
import './cta.css';

const FreelancingCTA = () => {
  return (
    <section className="cta-section">
      {/* Removed gradient overlay */}
      <div className="cta-container">
        <div className="cta-content">
          <h2 className="cta-title">Freelancing, Simplified</h2>
          <p className="cta-description">
            Step into a world of endless opportunities by joining multiple skilled
            freelancers and businesses working together
          </p>
          
          <div className="cta-buttons">
            <a href="/jobpost" className="cta-button primary">
              <span>Hire Talent</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </a>
            <a href="/jobs" className="cta-button secondary">
              <span>Find Work</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </a>
          </div>
        </div>
        
        <div className="cta-decoration">
          <div className="cta-circle circle-1"></div>
          <div className="cta-circle circle-2"></div>
          <div className="cta-circle circle-3"></div>
        </div>
      </div>
    </section>
  );
};

export default FreelancingCTA;