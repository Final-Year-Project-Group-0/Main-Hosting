import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import newRequest from "../../utils/newRequest";
import "./Review.scss";
import { Link } from "react-router-dom";

const Review = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 200;
  const shouldTruncate = review.desc.length > maxLength;
  
  const { isLoading, error, data } = useQuery({
    queryKey: [review.userId],
    queryFn: () =>
      newRequest.get(`/users/${review.userId}`).then((res) => {
        return res.data;
      }),
  });
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const renderContent = () => {
    if (shouldTruncate && !expanded) {
      return (
        <>
          <p>{review.desc.substring(0, maxLength)}...</p>
          <button 
            className="read-more" 
            onClick={() => setExpanded(true)}
          >
            Read more
          </button>
        </>
      );
    }
    
    return <p>{review.desc}</p>;
  };

  return (
    <div className="review">
      {isLoading ? (
        <div className="loading-review">
          <div className="loading-circle"></div>
          <div className="loading-text">Loading review...</div>
        </div>
      ) : error ? (
        <div className="error-review">
          <span>Error loading review</span>
        </div>
      ) : (
        <>
          <div className="review-header">
            <div className="user">
              <Link to={`/profile/${review.userId}`} className="user-link">
                <img 
                  className="pp" 
                  src={data.img || "/img/noavatar.jpg"} 
                  alt={data.username} 
                />
                <div className="info">
                  <span className="username">{data.username}</span>
                  <div className="country">
                    <span>{data.country || "Unknown"}</span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="review-meta">
              <div className="stars">
                {Array(review.star)
                  .fill()
                  .map((_, i) => (
                    <svg key={i} className="star-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ))}
                <span className="star-count">{review.star}</span>
              </div>
              <span className="review-date">{formatDate(review.createdAt)}</span>
            </div>
          </div>
          <div className="review-content">
            {renderContent()}
          </div>
          {expanded && shouldTruncate && (
            <button 
              className="read-less" 
              onClick={() => setExpanded(false)}
            >
              Show less
            </button>
          )}
          {review.helpful && (
            <div className="helpful-tag">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 9V5C14 4.20435 13.6839 3.44129 13.1213 2.87868C12.5587 2.31607 11.7956 2 11 2L5 14V22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V14C21 13.4696 20.7893 12.9609 20.4142 12.5858C20.0391 12.2107 19.5304 12 19 12H15L17 9H14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 14V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Helpful</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Review;