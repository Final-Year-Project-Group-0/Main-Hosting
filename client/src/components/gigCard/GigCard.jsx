import React, { useState } from "react";
import "./GigCard.scss";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function GigCard({ item }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const { isLoading, error, data } = useQuery({
    queryKey: [`${item.userId}`],
    queryFn: () =>
      newRequest.get(`/users/${item.userId}`).then((res) => {
        return res.data;
      }),
  });

  // Calculate the rating
  const calculateRating = (totalStars, starNumber) => {
    if (starNumber === 0) return 0;
    return Math.round(totalStars / starNumber);
  };

  // Format delivery date string - fixed to handle undefined days
  const formatDelivery = (days) => {
    // Handle undefined, null, or invalid values
    if (!days || isNaN(parseInt(days))) return "Express Delivery";
    
    const daysNum = parseInt(days);
    return daysNum === 1 ? "1 day delivery" : `${daysNum} days delivery`;
  };

  // Format sales count
  const formatSales = (sales) => {
    if (!sales) return "No orders yet";
    return sales === 1 ? "1 order" : `${sales} orders`;
  };

  // Handle save/bookmark functionality
  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <Link to={`/gig/${item._id}`} className="gig-card">
      <div className="image-container">
        {!isImageLoaded && (
          <div className="image-loading">
            <div className="image-loading-spinner"></div>
          </div>
        )}
        <img 
          src={item.cover || item.images?.[0]} 
          alt={item.title}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageLoaded(true)}
          className={isImageLoaded ? "loaded" : ""}
        />
        <div className={`save-btn ${isSaved ? "saved" : ""}`} onClick={handleSave}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      
      <div className="info">
        {!isLoading && !error && (
          <div className="user">
            <img 
              src={data?.img || "/img/noavatar.jpg"} 
              alt={data?.username} 
              className="user-avatar"
            />
            <span className="username">{data?.username}</span>
            {data?.isTopRated && (
              <span className="top-rated-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Top Rated
              </span>
            )}
          </div>
        )}
        
        <p className="title">{item.title || item.shortTitle}</p>
        
        <div className="stats-row">
          <div className="rating">
            {item.starNumber > 0 ? (
              <>
                <svg className="star-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="rating-score">
                  {calculateRating(item.totalStars, item.starNumber)}
                </span>
                <span className="rating-count">
                  ({item.starNumber})
                </span>
              </>
            ) : (
              <span className="no-reviews">New</span>
            )}
          </div>
          
          <div className="sales-count">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12H2M16 6L22 12L16 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{formatSales(item.sales)}</span>
          </div>
        </div>
      </div>
      
      <div className="details">
        <div className="price-delivery">
          <span className="delivery">{formatDelivery(item.deliveryTime || item.deliveryDate)}</span>
          <div className="price">
            <span className="from">From</span>
            <span className="amount">${item.price}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default GigCard;