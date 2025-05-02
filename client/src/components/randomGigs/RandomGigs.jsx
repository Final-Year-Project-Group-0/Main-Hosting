import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./RandomGigs.css";

const RandomGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistinctCategoryGigs = async () => {
      try {
        setLoading(true);
        const response = await newRequest.get("/gigs");
        
        // Create a map to store one gig per category
        const categoryMap = new Map();
        
        // Shuffle the array first to get random gigs within each category
        const shuffledGigs = [...response.data].sort(() => 0.5 - Math.random());
        
        // Filter for distinct categories (max 8 total - 2 rows of 4)
        shuffledGigs.forEach(gig => {
          // Only add if we don't already have this category and we're under 8 total
          if (!categoryMap.has(gig.cat) && categoryMap.size < 8) {
            categoryMap.set(gig.cat, gig);
          }
        });
        
        // If we don't have 8 distinct categories, fill remaining slots with random gigs
        if (categoryMap.size < 8) {
          for (const gig of shuffledGigs) {
            if (categoryMap.size >= 8) break;
            // Skip if we already have this gig or category
            if ([...categoryMap.values()].some(g => g._id === gig._id)) continue;
            categoryMap.set(`extra_${categoryMap.size}`, gig);
          }
        }
        
        // Convert map values to array
        const distinctGigs = [...categoryMap.values()];
        
        setGigs(distinctGigs);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching distinct category gigs:", error);
        setLoading(false);
      }
    };

    fetchDistinctCategoryGigs();
  }, []);

  // Calculate the rating - similar to GigCard
  const calculateRating = (totalStars, starNumber) => {
    if (starNumber === 0) return 0;
    return (totalStars / starNumber).toFixed(1);
  };

  return (
    <section className="random-gigs-section">
      <div className="container">
        <div className="section-header">
          <h2>Explore Popular Categories</h2>
          <p>Discover talented freelancers across various service categories</p>
        </div>

        {loading ? (
          <div className="gigs-loading">
            <div className="loading-spinner"></div>
            <p>Loading amazing services...</p>
          </div>
        ) : (
          <div className="gigs-grid">
            {gigs.map((gig) => (
              <Link 
                to={`/gigs?cat=${encodeURIComponent(gig.cat)}`} 
                key={gig._id} 
                className="gig-card"
              >
                <div className="gig-image-container">
                  <img src={gig.cover} alt={gig.title} className="gig-image" />
                  <div className="gig-overlay">
                    <span className="gig-category">{gig.cat}</span>
                  </div>
                </div>
                <div className="gig-info">
                  <h3 className="gig-title">{gig.shortTitle}</h3>
                  <div className="gig-rating">
                    {gig.starNumber > 0 ? (
                      <>
                        <span className="star-icon">★</span>
                        <span className="rating-value">{calculateRating(gig.totalStars, gig.starNumber)}</span>
                        <span className="rating-count">({gig.starNumber})</span>
                      </>
                    ) : (
                      <span className="no-reviews">New</span>
                    )}
                  </div>
                  <div className="gig-meta">
                    <span className="gig-sales">
                      {gig.sales > 0 ? (
                        <>{gig.sales} {gig.sales === 1 ? "sale" : "sales"}</>
                      ) : (
                        "No sales yet"
                      )}
                    </span>
                    <span className="gig-price">From ${gig.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="view-all-container">
          <Link to="/gigs" className="view-all-button">
            Browse All Categories
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="arrow-icon"
            >
              <path 
                d="M5 12h14M12 5l7 7-7 7" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RandomGigs;