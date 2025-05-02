import React, { useEffect, useState } from "react";
import { getRandomAdForCategory } from "./adData";
import "./JobAd.scss";

const JobAd = ({ category }) => {
  const [ad, setAd] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Get a random ad for the category when component mounts or category changes
    if (category) {
      const selectedAd = getRandomAdForCategory(category);
      setAd(selectedAd);
      setIsLoaded(false); // Reset loading state when ad changes

      // Animate in after a short delay
      setTimeout(() => {
        setIsVisible(true);
      }, 300);
    }
  }, [category]);

  // Track impressions (could be expanded to send to analytics)
  useEffect(() => {
    if (ad) {
      console.log(`Ad impression: ${ad.title} for category ${category}`);
      // Here you could add analytics tracking for impressions
    }
  }, [ad, category]);

  const handleAdClick = () => {
    console.log(`Ad clicked: ${ad.title}`);
    // Here you could add analytics tracking for clicks
  };

  // Don't render anything if no ad is found
  if (!ad) return null;

  return (
    <div className={`job-ad-container ${isLoaded ? 'loaded' : 'loading'} ${isVisible ? 'visible' : ''}`}>
      <div className="ad-badge">
        <span className="ad-badge-text">Sponsored</span>
      </div>
      
      <div className="ad-content">
        <div className="ad-image-container">
          <img 
            src={ad.image} 
            alt={ad.title} 
            className="ad-image"
            onLoad={() => setIsLoaded(true)}
            onError={(e) => {
              e.target.src = "/img/noavatar.jpg";
              e.target.onerror = null;
              setIsLoaded(true);
            }}
          />
          {!isLoaded && (
            <div className="ad-image-loading">
              <div className="ad-loading-spinner"></div>
            </div>
          )}
        </div>
        
        <h3 className="ad-title">{ad.title}</h3>
        
        <div className="ad-actions">
          <a 
            href={ad.link} 
            className="ad-link" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleAdClick}
          >
            Learn More
          </a>
          <button 
            className="ad-dismiss" 
            title="Dismiss ad" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const container = e.currentTarget.closest('.job-ad-container');
              if (container) {
                container.style.opacity = '0';
                container.style.height = '0';
                container.style.margin = '0';
                container.style.padding = '0';
                container.style.overflow = 'hidden';
                setTimeout(() => {
                  if (container.parentNode) {
                    container.parentNode.removeChild(container);
                  }
                }, 300);
              }
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobAd;