import React, { useEffect, useState } from "react";
import "./Gig.scss";
import { Link, useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Reviews from "../../components/reviews/Reviews";
import Ad from "../../components/ad/Ad";

function Gig() {
  const currentUserStr = localStorage.getItem("currentUser");
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  
  const { id } = useParams();
  const navigate = useNavigate();
  const [user] = useOutletContext();
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const { isLoading, error, data } = useQuery({
    queryKey: ["gig", id],
    queryFn: () =>
      newRequest.get(`/gigs/single/${id}`).then((res) => {
        return res.data;
      }),
  });

  const userId = data?.userId;

  const {
    isLoading: isLoadingUser,
    error: errorUser,
    data: dataUser,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () =>
      newRequest.get(`/users/${userId}`).then((res) => {
        return res.data;
      }),
    enabled: !!userId,
  });

  // If there's an error, display the login message and redirect after 3 seconds
  useEffect(() => {
    if (error || errorUser) {
      const timer = setTimeout(() => {
        navigate("/register"); // Redirect to the Register page after 3 seconds
      }, 3000);

      // Clean up the timeout if the component unmounts or if the error is fixed
      return () => clearTimeout(timer);
    }
  }, [error, errorUser, navigate]);

  // Calculate the rating
  const calculateRating = (totalStars, starNumber) => {
    if (starNumber === 0) return 0;
    return Math.round(totalStars / starNumber);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to handle contact seller
  const handleContact = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const sellerId = data.userId;
      const buyerId = user._id;
      const id = sellerId + buyerId;

      try {
        const res = await newRequest.get(`/conversations/single/${id}`);
        navigate(`/message/${res.data.id}`);
      } catch (err) {
        if (err.response?.status === 404) {
          const res = await newRequest.post(`/conversations/`, {
            to: sellerId,
          });
          navigate(`/message/${res.data.id}`);
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error("Error contacting seller:", err);
    }
  };

  return (
    <div className="gig">
      {isLoading || isLoadingUser ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading gig details...</p>
        </div>
      ) : error || errorUser ? (
        <div className="error-message">
          <svg
            width="60"
            height="60"
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
          <h2>Please Log In or Sign Up to Continue</h2>
          <p>You will be redirected shortly...</p>
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login Now
          </button>
        </div>
      ) : (
        <div className="container">
          <div className="gig-header">
            <div className="breadcrumbs">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <Link to={`/gigs?cat=${data.cat}`}>{data.cat}</Link>
              <span className="separator">/</span>
              <span className="current">Gig Details</span>
            </div>

            <h1 className="gig-title">{data.title}</h1>

            <div className="seller-info">
              <Link to={`/profile/${data.userId}`} className="seller-link">
                <img
                  className="seller-avatar"
                  src={dataUser.img || "/img/noavatar.jpg"}
                  alt={dataUser.username}
                />
                <div className="seller-details">
                  <span className="seller-name">{dataUser.username}</span>
                  {data.starNumber === 0 ? (
                    <span className="no-reviews">New Seller</span>
                  ) : (
                    <div className="seller-rating">
                      {Array(calculateRating(data.totalStars, data.starNumber))
                        .fill()
                        .map((_, i) => (
                          <svg key={i} className="star-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ))}
                      <span className="rating-score">
                        {calculateRating(data.totalStars, data.starNumber)}
                      </span>
                      <span className="rating-count">
                        ({data.starNumber})
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          </div>

          <div className="gig-content">
            <div className="left">
              <div className="gallery-container">
                <div className="main-image">
                  <img
                    src={data.images[activeImage]}
                    alt={data.title}
                    onLoad={() => setIsImageLoading(false)}
                    onError={() => setIsImageLoading(false)}
                  />
                  {isImageLoading && (
                    <div className="image-loading">
                      <div className="image-loading-spinner"></div>
                    </div>
                  )}
                </div>
                <div className="thumbnails">
                  {data.images.map((img, index) => (
                    <div 
                      key={index} 
                      className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                      onClick={() => setActiveImage(index)}
                    >
                      <img 
                        src={img} 
                        alt={`Thumbnail ${index+1}`} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="gig-description">
                <h2>About This Gig</h2>
                <div className="description-content">
                  {data.desc}
                </div>
              </div>

              <div className="seller-profile">
                <h2>About The Seller</h2>
                <div className="seller-card">
                  <div className="seller-header">
                    <img 
                      src={dataUser.img || "/img/noavatar.jpg"} 
                      alt={dataUser.username} 
                      className="seller-profile-img"
                    />
                    <h3 className="seller-username">{dataUser.username}</h3>
                    
                    {data.starNumber > 0 ? (
                      <div className="seller-rating">
                        {Array(calculateRating(data.totalStars, data.starNumber))
                          .fill()
                          .map((_, i) => (
                            <svg key={i} className="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ))}
                        <span className="rating-score">
                          {calculateRating(data.totalStars, data.starNumber)}
                        </span>
                        <span className="rating-count">
                          ({data.starNumber})
                        </span>
                      </div>
                    ) : (
                      <span className="no-reviews">No Reviews Yet</span>
                    )}
                    
                    <Link 
                      to={`/profile/${dataUser._id}`} 
                      className="contact-me-btn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 15H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Contact Me
                    </Link>
                  </div>
                  
                  <div className="seller-stats">
                    <div className="stat-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <div className="stat-content">
                        <span className="stat-label">Avg. response time</span>
                        <span className="stat-value">4 hours</span>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      <div className="stat-content">
                        <span className="stat-label">Member since</span>
                        <span className="stat-value">{dataUser.createdAt ? formatDate(dataUser.createdAt) : "N/A"}</span>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div className="stat-content">
                        <span className="stat-label">Last delivery</span>
                        <span className="stat-value">1 day</span>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div className="stat-content">
                        <span className="stat-label">From</span>
                        <span className="stat-value">{dataUser.country || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="seller-description">
                    <p>{dataUser.desc || "I am the seller. I will provide many services"}</p>
                  </div>
                </div>
              </div>

              <div className="reviews-section">
                <Reviews gigId={id} />
              </div>
            </div>

            <div className="right">
              <Ad category={data.cat} />
              
              {(!currentUser || !currentUser.isSeller) && (
                <div className="price-card">
                  <div className="package-header">
                    <h3>{data.shortTitle || "Standard Package"}</h3>
                    <span className="package-price">${data.price}</span>
                  </div>
                  
                  <p className="package-description">
                    {data.shortDesc || "No description provided."}
                  </p>
                  
                  <div className="delivery-info">
                    <div className="info-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span>{data.deliveryTime} Days Delivery</span>
                    </div>
                    <div className="info-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4V9H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 20V15H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 4L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 20L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 12H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M17 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M12 4V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M12 17V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span>{data.revisionNumber} Revisions</span>
                    </div>
                  </div>
                  
                  <div className="features-list">
                    {data.features && data.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to={`/pay/${id}`} className="continue-btn">
                    Continue
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gig;