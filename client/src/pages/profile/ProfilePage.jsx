// import React, { useState, useEffect } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import newRequest from "../../utils/newRequest";
// import "./ProfilePage.scss";

// // Component to display a single review
// const ReviewItem = ({ review }) => {
//   const { isLoading, error, data: reviewer } = useQuery({
//     queryKey: ["user", review.reviewerId],
//     queryFn: () => newRequest.get(`/users/${review.reviewerId}`).then((res) => res.data),
//     enabled: !!review.reviewerId,
//   });

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   if (isLoading) return <div className="review-loading">Loading review...</div>;
//   if (error) return null; // Skip rendering if there's an error

//   return (
//     <div className="review-item">
//       <div className="review-header">
//         <div className="reviewer-info">
//           <Link to={`/profile/${reviewer._id}`} className="reviewer-link">
//             <img 
//               src={reviewer.img || "/img/noavatar.jpg"} 
//               alt={reviewer.username}
//               className="reviewer-avatar"
//               onError={(e) => {
//                 e.target.src = "/img/noavatar.jpg";
//               }}
//             />
//             <div className="reviewer-details">
//               <span className="reviewer-name">{reviewer.username}</span>
//               <span className="review-date">{formatDate(review.createdAt)}</span>
//             </div>
//           </Link>
//         </div>
//         <div className="review-rating">
//           {Array(review.rating)
//             .fill()
//             .map((_, i) => (
//               <span key={i} className="star-filled">★</span>
//             ))}
//           {Array(5 - review.rating)
//             .fill()
//             .map((_, i) => (
//               <span key={i} className="star-empty">★</span>
//             ))}
//         </div>
//       </div>
//       <div className="review-content">
//         <p>{review.comment}</p>
//       </div>
//     </div>
//   );
// };

// const ProfilePage = () => {
//   const { profileId } = useParams();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("about");
//   const [darkMode, setDarkMode] = useState(
//     localStorage.getItem("darkMode") === "true" ||
//     window.matchMedia("(prefers-color-scheme: dark)").matches
//   );
//   const [currentUser, setCurrentUser] = useState(
//     JSON.parse(localStorage.getItem("currentUser"))
//   );
  
//   // Determine if this is the current user's profile
//   const isOwnProfile = currentUser?._id === profileId;

//   // Check dark mode on mount and listen for changes
//   useEffect(() => {
//     const updateDarkMode = () => {
//       setDarkMode(localStorage.getItem("darkMode") === "true");
//     };

//     // Initial check
//     updateDarkMode();

//     // Set up event listener for storage changes
//     window.addEventListener('storage', updateDarkMode);
//     window.addEventListener('darkModeChange', updateDarkMode);
    
//     // Clean up
//     return () => {
//       window.removeEventListener('storage', updateDarkMode);
//       window.removeEventListener('darkModeChange', updateDarkMode);
//     };
//   }, []);

//   // Listen for user login/logout changes
//   useEffect(() => {
//     const handleUserChange = () => {
//       setCurrentUser(JSON.parse(localStorage.getItem("currentUser")));
//     };

//     window.addEventListener('userLoggedIn', handleUserChange);
//     window.addEventListener('userProfileUpdated', handleUserChange);
    
//     return () => {
//       window.removeEventListener('userLoggedIn', handleUserChange);
//       window.removeEventListener('userProfileUpdated', handleUserChange);
//     };
//   }, []);

//   // Fetch profile user data
//   const { 
//     isLoading: isLoadingUser, 
//     error: userError, 
//     data: userData 
//   } = useQuery({
//     queryKey: ["user", profileId],
//     queryFn: () => newRequest.get(`/users/${profileId}`).then((res) => res.data),
//     enabled: !!profileId,
//   });

//   // For sellers, fetch their gigs
//   const { 
//     isLoading: isLoadingGigs, 
//     error: gigsError, 
//     data: gigsData 
//   } = useQuery({
//     queryKey: ["gigs", profileId],
//     queryFn: () => newRequest.get(`/gigs?userId=${profileId}`).then((res) => res.data),
//     enabled: !!profileId && userData?.isSeller === true,
//   });

//   // Fetch reviews of the user
//   const { 
//     isLoading: isLoadingReviews, 
//     error: reviewsError, 
//     data: reviewsData 
//   } = useQuery({
//     queryKey: ["user-reviews", profileId],
//     queryFn: () => newRequest.get(`/job-reviews/user/${profileId}`).then((res) => res.data),
//     enabled: !!profileId,
//   });

//   // Helper function to calculate the average rating
//   const calculateAverageRating = (reviews) => {
//     if (!reviews || reviews.length === 0) return 0;
//     const sum = reviews.reduce((total, review) => total + review.rating, 0);
//     return (sum / reviews.length).toFixed(1);
//   };

//   // Handle message button click
//   const handleContact = async () => {
//     if (!currentUser) {
//       navigate("/login");
//       return;
//     }

//     try {
//       // First try to get existing conversation
//       const sellerId = userData.isSeller ? userData._id : currentUser._id;
//       const buyerId = userData.isSeller ? currentUser._id : userData._id;
//       const id = sellerId + buyerId;

//       try {
//         const res = await newRequest.get(`/conversations/single/${id}`);
//         navigate(`/message/${res.data.id}`);
//       } catch (err) {
//         // If conversation doesn't exist, create a new one
//         if (err.response?.status === 404) {
//           const res = await newRequest.post(`/conversations`, {
//             to: userData._id,
//           });
//           navigate(`/message/${res.data.id}`);
//         }
//       }
//     } catch (err) {
//       console.error("Error contacting user:", err);
//     }
//   };

//   // Function to close GitHub notification
//   const closeGithubNotification = () => {
//     const notification = document.querySelector('.github-notification');
//     if (notification) {
//       notification.style.display = 'none';
//     }
//   };

//   if (isLoadingUser) {
//     return (
//       <div className={`profile-page ${darkMode ? "dark-mode" : ""}`}>
//         <div className="loading-wrapper">
//           <div className="loading-spinner"></div>
//           <p>Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (userError) {
//     return (
//       <div className={`profile-page ${darkMode ? "dark-mode" : ""}`}>
//         <div className="error-message">
//           <h3>Error Loading Profile</h3>
//           <p>{userError.response?.data || "User not found"}</p>
//           <button className="back-button" onClick={() => navigate("/")}>
//             Return to Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const averageRating = calculateAverageRating(reviewsData);

//   return (
//     <div className={`profile-page ${darkMode ? "dark-mode" : ""}`}>
//       <div className="profile-container">
//         {/* Profile Header Section */}
//         <div className="profile-header">
//           <div className="profile-banner">
//             {/* Optional banner image could be added here */}
//           </div>
          
//           <div className="profile-header-content">
//             <div className="profile-avatar-wrapper">
//               <img 
//                 src={userData.img || "/img/noavatar.jpg"} 
//                 alt={userData.username} 
//                 className="profile-avatar" 
//                 onError={(e) => {
//                   e.target.src = "/img/noavatar.jpg";
//                 }}
//               />
//             </div>
            
//             <div className="profile-header-info">
//               <div className="profile-name-section">
//                 <h1 className="profile-name">{userData.username}</h1>
//                 <div className="profile-badges">
//                   <span className={`user-type-badge ${userData.isSeller ? "seller" : "client"}`}>
//                     {userData.isSeller ? "Freelancer" : "Client"}
//                   </span>
//                   {userData.isSeller && (
//                     <span className="rating-badge">
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="currentColor"/>
//                       </svg>
//                       {averageRating} ({reviewsData?.length || 0})
//                     </span>
//                   )}
                  
//                   {/* GitHub badge if linked - Only for freelancers */}
//                   {userData.isSeller && userData.githubUsername && (
//                     <a 
//                       href={`https://github.com/${userData.githubUsername}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="github-badge"
//                     >
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor"/>
//                       </svg>
//                       GitHub
//                     </a>
//                   )}
//                 </div>
//               </div>
              
//               <div className="profile-location">
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
//                 </svg>
//                 <span>{userData.country || "Location not specified"}</span>
//               </div>
              
//               {userData.isSeller && userData.desc && (
//                 <p className="profile-headline">{userData.desc}</p>
//               )}
//             </div>
            
//             <div className="profile-actions">
//               {!isOwnProfile && (
//                 <button className="message-button" onClick={handleContact}>
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM18 14H6V12H18V14ZM18 11H6V9H18V11ZM18 8H6V6H18V8Z" fill="currentColor"/>
//                   </svg>
//                   Message
//                 </button>
//               )}
              
//               {isOwnProfile && (
//                 <Link to="/myprofile" className="edit-profile-button">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
//                   </svg>
//                   Edit Profile
//                 </Link>
//               )}
//             </div>
//           </div>
//         </div>
        
//         {/* Profile Navigation Tabs */}
//         <div className="profile-navigation">
//           <div className="profile-tabs">
//             <button 
//               className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
//               onClick={() => setActiveTab('about')}
//             >
//               About
//             </button>
            
//             {userData.isSeller && (
//               <button 
//                 className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('services')}
//               >
//                 Services
//               </button>
//             )}
            
//             <button 
//               className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
//               onClick={() => setActiveTab('reviews')}
//             >
//               Reviews
//             </button>
            
//             {/* GitHub tab only for freelancers with connected GitHub */}
//             {userData.isSeller && userData.githubUsername && (
//               <button 
//                 className={`tab-button ${activeTab === 'github' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('github')}
//               >
//                 GitHub
//               </button>
//             )}
//           </div>
//         </div>
        
//         {/* Profile Content */}
//         <div className="profile-content">
//           {/* About Tab */}
//           {activeTab === 'about' && (
//             <div className="about-section">
//               <div className="section-card">
//                 <h2 className="section-title">About {userData.username}</h2>
                
//                 {userData.desc ? (
//                   <p className="about-description">{userData.desc}</p>
//                 ) : (
//                   <p className="empty-description">
//                     {isOwnProfile 
//                       ? "You haven't added a description yet. Add one to tell clients about yourself!" 
//                       : `${userData.username} hasn't added a description yet.`}
//                   </p>
//                 )}
                
//                 <div className="user-details">
//                   <div className="detail-item">
//                     <span className="detail-label">Member Since</span>
//                     <span className="detail-value">
//                       {new Date(userData.createdAt).toLocaleDateString('en-US', {
//                         year: 'numeric',
//                         month: 'long',
//                         day: 'numeric'
//                       })}
//                     </span>
//                   </div>
                  
//                   {userData.isSeller && userData.skills && (
//                     <div className="detail-item">
//                       <span className="detail-label">Skills</span>
//                       <div className="skills-list">
//                         {userData.skills.split(',').map((skill, index) => (
//                           <span key={index} className="skill-tag">{skill.trim()}</span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
                  
//                   {userData.certifications && userData.certifications.length > 0 && (
//                     <div className="detail-item">
//                       <span className="detail-label">Certifications</span>
//                       <ul className="certifications-list">
//                         {userData.certifications.map((cert, index) => (
//                           <li key={index} className="certification-item">
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                               <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
//                             </svg>
//                             {cert}
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   )}
                  
//                   {/* GitHub Profile Section - Only for freelancers */}
//                   {userData.isSeller && userData.githubUsername && (
//                     <div className="detail-item github-profile">
//                       <span className="detail-label">GitHub Profile</span>
//                       <div className="github-info">
//                         <a 
//                           href={`https://github.com/${userData.githubUsername}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="github-link"
//                         >
//                           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                             <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor"/>
//                           </svg>
//                           <span>{userData.githubUsername}</span>
//                         </a>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
              
//               {/* Contact Info Section */}
//               <div className="section-card">
//                 <h2 className="section-title">Contact Information</h2>
                
//                 <div className="contact-details">
//                   {userData.email && (
//                     <div className="contact-item">
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
//                       </svg>
//                       <span>
//                         {isOwnProfile || userData.email.endsWith("hidden") 
//                           ? userData.email 
//                           : userData.email.split('@')[0] + '@****'}
//                       </span>
//                     </div>
//                   )}
                  
//                   {userData.phone && (
//                     <div className="contact-item">
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M20.01 15.38C18.78 15.38 17.59 15.18 16.48 14.82C16.13 14.7 15.74 14.79 15.47 15.06L13.9 17.03C11.07 15.68 8.42 13.13 7.01 10.2L8.96 8.54C9.23 8.26 9.31 7.87 9.2 7.52C8.83 6.41 8.64 5.22 8.64 3.99C8.64 3.45 8.19 3 7.65 3H4.19C3.65 3 3 3.24 3 3.99C3 13.28 10.73 21 20.01 21C20.72 21 21 20.37 21 19.82V16.37C21 15.83 20.55 15.38 20.01 15.38Z" fill="currentColor"/>
//                       </svg>
//                       <span>
//                         {isOwnProfile 
//                           ? userData.phone 
//                           : userData.phone.substring(0, 3) + "****" + userData.phone.substring(userData.phone.length - 2)}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
          
//           {/* Services Tab for Sellers */}
//           {activeTab === 'services' && userData.isSeller && (
//             <div className="services-section">
//               <h2 className="section-title">Services Offered</h2>
              
//               {isLoadingGigs ? (
//                 <div className="loading-services">Loading services...</div>
//               ) : gigsError ? (
//                 <div className="error-services">
//                   Error loading services: {gigsError.response?.data || gigsError.message}
//                 </div>
//               ) : gigsData && gigsData.length > 0 ? (
//                 <div className="gigs-grid">
//                   {gigsData.map((gig) => (
//                     <Link to={`/gig/${gig._id}`} className="gig-card" key={gig._id}>
//                       <div className="gig-img">
//                         <img 
//                           src={gig.cover || "/img/noimage.jpg"} 
//                           alt={gig.title}
//                           onError={(e) => {
//                             e.target.src = "/img/noimage.jpg";
//                           }}
//                         />
//                       </div>
//                       <div className="gig-content">
//                         <h3 className="gig-title">{gig.title}</h3>
//                         <p className="gig-desc">{gig.shortDesc}</p>
//                         <div className="gig-footer">
//                           <div className="gig-rating">
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                               <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="currentColor"/>
//                             </svg>
//                             <span>
//                               {gig.starNumber > 0 
//                                 ? (gig.totalStars / gig.starNumber).toFixed(1) 
//                                 : "New"}
//                               {gig.starNumber > 0 && ` (${gig.starNumber})`}
//                             </span>
//                           </div>
//                           <div className="gig-price">From ${gig.price}</div>
//                         </div>
//                       </div>
//                     </Link>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="empty-services">
//                   <p>
//                     {isOwnProfile 
//                       ? "You haven't created any services yet." 
//                       : `${userData.username} hasn't created any services yet.`}
//                   </p>
//                   {isOwnProfile && (
//                     <Link to="/add" className="add-service-btn">
//                       Create a Service
//                     </Link>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
          
//           {/* GitHub Tab - Only visible for freelancers with GitHub connected */}
//           {activeTab === 'github' && userData.isSeller && userData.githubUsername && (
//             <div className="github-section">
//               <h2 className="section-title">GitHub Projects</h2>
              
//               <div className="github-profile-card">
//                 <div className="github-header">
//                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill={darkMode ? "#f0f6fc" : "#24292e"}/>
//                   </svg>
//                   <h3>
//                     <a 
//                       href={`https://github.com/${userData.githubUsername}`}
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                     >
//                       {userData.githubUsername}
//                     </a>
//                   </h3>
//                 </div>
                
//                 <div className="github-content">
//                   <p>View {userData.username}'s projects and contributions on GitHub.</p>
//                   <div className="github-links">
//                     <a 
//                       href={`https://github.com/${userData.githubUsername}`}
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="github-btn"
//                     >
//                       View Profile
//                     </a>
//                     <a 
//                       href={`https://github.com/${userData.githubUsername}?tab=repositories`}
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="github-btn secondary"
//                     >
//                       View Repositories
//                     </a>
//                   </div>
//                 </div>
                
//                 <div className="github-iframe-wrapper">
//                   <iframe 
//                     src={`https://github-readme-stats.vercel.app/api?username=${userData.githubUsername}&show_icons=true&theme=${darkMode ? 'dark' :'default'}&hide_border=true&count_private=true`}
//                     frameBorder="0"
//                     scrolling="no"
//                     width="100%"
//                     height="200"
//                     title={`${userData.username}'s GitHub stats`}
//                   ></iframe>
//                 </div>
                
//                 <div className="github-footer">
//                   <small>
//                     GitHub integration helps freelancers showcase their coding skills and project contributions to potential clients.
//                   </small>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           {/* Reviews Tab */}
//           {activeTab === 'reviews' && (
//             <div className="reviews-section">
//               <h2 className="section-title">
//                 Reviews {reviewsData ? `(${reviewsData.length})` : ''}
//               </h2>
              
//               {isLoadingReviews ? (
//                 <div className="loading-reviews">Loading reviews...</div>
//               ) : reviewsError ? (
//                 <div className="error-reviews">
//                   {reviewsError.response?.status === 404 
//                     ? "No reviews found" 
//                     : `Error loading reviews: ${reviewsError.response?.data || reviewsError.message}`}
//                 </div>
//               ) : reviewsData && reviewsData.length > 0 ? (
//                 <div className="reviews-list">
//                   {reviewsData.map((review) => (
//                     <ReviewItem key={review._id} review={review} />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="empty-reviews">
//                   <p>
//                     {isOwnProfile 
//                       ? "You haven't received any reviews yet." 
//                       : `${userData.username} hasn't received any reviews yet.`}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
      
//       {/* GitHub Notification for Freelancers - Only shown to freelancers without GitHub connected */}
//       {isOwnProfile && userData.isSeller && !userData.githubUsername && (
//         <div className="github-notification">
//           <div className="notification-content">
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor"/>
//             </svg>
//             <div className="notification-text">
//               <p>Connect your GitHub account to showcase your projects and contributions to potential clients.</p>
//               <Link to="/myprofile" className="github-link-btn">
//                 Connect GitHub Account
//               </Link>
//             </div>
//             <button className="close-notification" onClick={closeGithubNotification}>
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProfilePage;



import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import "./ProfilePage.scss";

// Component to display a single review
const ReviewItem = ({ review }) => {
  const { isLoading, error, data: reviewer } = useQuery({
    queryKey: ["user", review.reviewerId],
    queryFn: () => newRequest.get(`/users/${review.reviewerId}`).then((res) => res.data),
    enabled: !!review.reviewerId,
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) return <div className="review-loading">Loading review...</div>;
  if (error) return null; // Skip rendering if there's an error

  return (
    <div className="review-item">
      <div className="review-header">
        <div className="reviewer-info">
          <Link to={`/profile/${reviewer._id}`} className="reviewer-link">
            <img 
              src={reviewer.img || "/img/noavatar.jpg"} 
              alt={reviewer.username}
              className="reviewer-avatar"
              onError={(e) => {
                e.target.src = "/img/noavatar.jpg";
              }}
            />
            <div className="reviewer-details">
              <span className="reviewer-name">{reviewer.username}</span>
              <span className="review-date">{formatDate(review.createdAt)}</span>
            </div>
          </Link>
        </div>
        <div className="review-rating">
          {Array(review.rating)
            .fill()
            .map((_, i) => (
              <span key={i} className="star-filled">★</span>
            ))}
          {Array(5 - review.rating)
            .fill()
            .map((_, i) => (
              <span key={i} className="star-empty">★</span>
            ))}
        </div>
      </div>
      <div className="review-content">
        <p>{review.comment}</p>
      </div>
    </div>
  );
};

// Helper function to get file name from Cloudinary URL
const getCertificateName = (url, index) => {
  // Extract filename from URL if possible
  try {
    const urlParts = url.split('/');
    const filenameWithExtension = urlParts[urlParts.length - 1];
    // Remove extension and any upload parameters
    const filename = filenameWithExtension.split('.')[0].split('_')[0];
    
    // If we can extract a meaningful name, use it; otherwise use generic name
    if (filename && filename.length > 3 && !/^\d+$/.test(filename)) {
      // Capitalize and replace underscores with spaces
      return filename.charAt(0).toUpperCase() + filename.slice(1).replace(/_/g, ' ');
    }
  } catch (e) {
    console.log("Error parsing certificate name:", e);
  }
  
  // Default to generic name
  return `Certificate ${index + 1}`;
};

const ProfilePage = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("about");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" ||
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );
  
  // Determine if this is the current user's profile
  const isOwnProfile = currentUser?._id === profileId;

  // Check dark mode on mount and listen for changes
  useEffect(() => {
    const updateDarkMode = () => {
      setDarkMode(localStorage.getItem("darkMode") === "true");
    };

    // Initial check
    updateDarkMode();

    // Set up event listener for storage changes
    window.addEventListener('storage', updateDarkMode);
    window.addEventListener('darkModeChange', updateDarkMode);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', updateDarkMode);
      window.removeEventListener('darkModeChange', updateDarkMode);
    };
  }, []);

  // Listen for user login/logout changes
  useEffect(() => {
    const handleUserChange = () => {
      setCurrentUser(JSON.parse(localStorage.getItem("currentUser")));
    };

    window.addEventListener('userLoggedIn', handleUserChange);
    window.addEventListener('userProfileUpdated', handleUserChange);
    
    return () => {
      window.removeEventListener('userLoggedIn', handleUserChange);
      window.removeEventListener('userProfileUpdated', handleUserChange);
    };
  }, []);

  // Fetch profile user data
  const { 
    isLoading: isLoadingUser, 
    error: userError, 
    data: userData 
  } = useQuery({
    queryKey: ["user", profileId],
    queryFn: () => newRequest.get(`/users/${profileId}`).then((res) => res.data),
    enabled: !!profileId,
  });

  // For sellers, fetch their gigs
  const { 
    isLoading: isLoadingGigs, 
    error: gigsError, 
    data: gigsData 
  } = useQuery({
    queryKey: ["gigs", profileId],
    queryFn: () => newRequest.get(`/gigs?userId=${profileId}`).then((res) => res.data),
    enabled: !!profileId && userData?.isSeller === true,
  });

  // Fetch reviews of the user
  const { 
    isLoading: isLoadingReviews, 
    error: reviewsError, 
    data: reviewsData 
  } = useQuery({
    queryKey: ["user-reviews", profileId],
    queryFn: () => newRequest.get(`/job-reviews/user/${profileId}`).then((res) => res.data),
    enabled: !!profileId,
  });

  // Helper function to calculate the average rating
  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Handle message button click
  const handleContact = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      // First try to get existing conversation
      const sellerId = userData.isSeller ? userData._id : currentUser._id;
      const buyerId = userData.isSeller ? currentUser._id : userData._id;
      const id = sellerId + buyerId;

      try {
        const res = await newRequest.get(`/conversations/single/${id}`);
        navigate(`/message/${res.data.id}`);
      } catch (err) {
        // If conversation doesn't exist, create a new one
        if (err.response?.status === 404) {
          const res = await newRequest.post(`/conversations`, {
            to: userData._id,
          });
          navigate(`/message/${res.data.id}`);
        }
      }
    } catch (err) {
      console.error("Error contacting user:", err);
    }
  };

  // Function to close GitHub notification
  const closeGithubNotification = () => {
    const notification = document.querySelector('.github-notification');
    if (notification) {
      notification.style.display = 'none';
    }
  };

  if (isLoadingUser) {
    return (
      <div className={`profile-page ${darkMode ? "dark-mode" : ""}`}>
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className={`profile-page ${darkMode ? "dark-mode" : ""}`}>
        <div className="error-message">
          <h3>Error Loading Profile</h3>
          <p>{userError.response?.data || "User not found"}</p>
          <button className="back-button" onClick={() => navigate("/")}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const averageRating = calculateAverageRating(reviewsData);

  return (
    <div className={`profile-page ${darkMode ? "dark-mode" : ""}`}>
      <div className="profile-container">
        {/* Profile Header Section */}
        <div className="profile-header">
          <div className="profile-banner">
            {/* Optional banner image could be added here */}
          </div>
          
          <div className="profile-header-content">
            <div className="profile-avatar-wrapper">
              <img 
                src={userData.img || "/img/noavatar.jpg"} 
                alt={userData.username} 
                className="profile-avatar" 
                onError={(e) => {
                  e.target.src = "/img/noavatar.jpg";
                }}
              />
            </div>
            
            <div className="profile-header-info">
              <div className="profile-name-section">
                <h1 className="profile-name">{userData.username}</h1>
                <div className="profile-badges">
                  <span className={`user-type-badge ${userData.isSeller ? "seller" : "client"}`}>
                    {userData.isSeller ? "Freelancer" : "Client"}
                  </span>
                  {userData.isSeller && (
                    <span className="rating-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="currentColor"/>
                      </svg>
                      {averageRating} ({reviewsData?.length || 0})
                    </span>
                  )}
                  
                  {/* GitHub badge if linked - Only for freelancers */}
                  {userData.isSeller && userData.githubUsername && (
                    <a 
                      href={`https://github.com/${userData.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="github-badge"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor"/>
                      </svg>
                      GitHub
                    </a>
                  )}
                </div>
              </div>
              
              <div className="profile-location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                </svg>
                <span>{userData.country || "Location not specified"}</span>
              </div>
              
              {userData.isSeller && userData.desc && (
                <p className="profile-headline">{userData.desc}</p>
              )}
            </div>
            
            {/* <div className="profile-actions">
              {!isOwnProfile && (
                <button className="message-button" onClick={handleContact}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM18 14H6V12H18V14ZM18 11H6V9H18V11ZM18 8H6V6H18V8Z" fill="currentColor"/>
                  </svg>
                  Message
                </button>
              )}
              
              {isOwnProfile && (
                <Link to="/myprofile" className="edit-profile-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                  </svg>
                  Edit Profile
                </Link>
              )}
            </div> */}

<div className="profile-actions">
  {!isOwnProfile && (
    <>
      {/* Only show the message button if:
          1. Current user is NOT a seller and the profile user IS a seller (client messaging freelancer)
          2. Current user IS a seller and profile user is NOT a seller (freelancer messaging client) */}
      {((!currentUser?.isSeller && userData.isSeller) || 
        (currentUser?.isSeller && !userData.isSeller)) ? (
        <button className="message-button" onClick={handleContact}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM18 14H6V12H18V14ZM18 11H6V9H18V11ZM18 8H6V6H18V8Z" fill="currentColor"/>
          </svg>
          Message
        </button>
      ) : currentUser?.isSeller && userData.isSeller ? (
        <div className="message-disabled">

        </div>
      ) : null}
    </>
  )}
  
  {isOwnProfile && (
    <Link to="/myprofile" className="edit-profile-button">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
      </svg>
      Edit Profile
    </Link>
  )}
</div>
          </div>
        </div>
        
        {/* Profile Navigation Tabs */}
        <div className="profile-navigation">
          <div className="profile-tabs">
            <button 
              className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
            
            {userData.isSeller && (
              <button 
                className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                Services
              </button>
            )}
            
            <button 
              className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
            
            {/* GitHub tab only for freelancers with connected GitHub */}
            {userData.isSeller && userData.githubUsername && (
              <button 
                className={`tab-button ${activeTab === 'github' ? 'active' : ''}`}
                onClick={() => setActiveTab('github')}
              >
                GitHub
              </button>
            )}
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="profile-content">
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="about-section">
              <div className="section-card">
                <h2 className="section-title">About {userData.username}</h2>
                
                {userData.desc ? (
                  <p className="about-description">{userData.desc}</p>
                ) : (
                  <p className="empty-description">
                    {isOwnProfile 
                      ? "You haven't added a description yet. Add one to tell clients about yourself!" 
                      : `${userData.username} hasn't added a description yet.`}
                  </p>
                )}
                
                <div className="user-details">
                  <div className="detail-item">
                    <span className="detail-label">Member Since</span>
                    <span className="detail-value">
                      {new Date(userData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {userData.isSeller && userData.skills && (
                    <div className="detail-item">
                      <span className="detail-label">Skills</span>
                      <div className="skills-list">
                        {userData.skills.split(',').map((skill, index) => (
                          <span key={index} className="skill-tag">{skill.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* {userData.certifications && userData.certifications.length > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Certifications</span>
                      <ul className="certifications-list">
                        {userData.certifications.map((cert, index) => (
                          <li key={index} className="certification-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
                            </svg>
                            <a 
                              href={cert} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="certification-link"
                            >
                              {getCertificateName(cert, index)}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )} */}



{userData.certifications && userData.certifications.length > 0 && (
  <div className="detail-item">
    <span className="detail-label">Certifications</span>
    <ul className="certifications-list">
      {userData.certifications.map((cert, index) => (
        <li key={index} className="certification-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
          </svg>
          <a 
            href={cert} 
            target="_blank" 
            rel="noopener noreferrer"
            className="certification-link"
          >
            Certificate {index + 1}
          </a>
        </li>
      ))}
    </ul>
  </div>
)}
                  
                  {/* GitHub Profile Section - Only for freelancers */}
                  {userData.isSeller && userData.githubUsername && (
                    <div className="detail-item github-profile">
                      <span className="detail-label">GitHub Profile</span>
                      <div className="github-info">
                        <a 
                          href={`https://github.com/${userData.githubUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="github-link"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor"/>
                          </svg>
                          <span>{userData.githubUsername}</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Contact Info Section */}
              <div className="section-card">
                <h2 className="section-title">Contact Information</h2>
                
                <div className="contact-details">
                  {userData.email && (
                    <div className="contact-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                      </svg>
                      <span>
                        {isOwnProfile || userData.email.endsWith("hidden") 
                          ? userData.email 
                          : userData.email.split('@')[0] + '@****'}
                      </span>
                    </div>
                  )}
                  
                  {userData.phone && (
                    <div className="contact-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.01 15.38C18.78 15.38 17.59 15.18 16.48 14.82C16.13 14.7 15.74 14.79 15.47 15.06L13.9 17.03C11.07 15.68 8.42 13.13 7.01 10.2L8.96 8.54C9.23 8.26 9.31 7.87 9.2 7.52C8.83 6.41 8.64 5.22 8.64 3.99C8.64 3.45 8.19 3 7.65 3H4.19C3.65 3 3 3.24 3 3.99C3 13.28 10.73 21 20.01 21C20.72 21 21 20.37 21 19.82V16.37C21 15.83 20.55 15.38 20.01 15.38Z" fill="currentColor"/>
                      </svg>
                      <span>
                        {isOwnProfile 
                          ? userData.phone 
                          : userData.phone.substring(0, 3) + "****" + userData.phone.substring(userData.phone.length - 2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Services Tab for Sellers */}
          {activeTab === 'services' && userData.isSeller && (
            <div className="services-section">
              <h2 className="section-title">Services Offered</h2>
              
              {isLoadingGigs ? (
                <div className="loading-services">Loading services...</div>
              ) : gigsError ? (
                <div className="error-services">
                  Error loading services: {gigsError.response?.data || gigsError.message}
                </div>
              ) : gigsData && gigsData.length > 0 ? (
                <div className="gigs-grid">
                  {gigsData.map((gig) => (
                    <Link to={`/gig/${gig._id}`} className="gig-card" key={gig._id}>
                      <div className="gig-img">
                        <img 
                          src={gig.cover || "/img/noimage.jpg"} 
                          alt={gig.title}
                          onError={(e) => {
                            e.target.src = "/img/noimage.jpg";
                          }}
                        />
                      </div>
                      <div className="gig-content">
                        <h3 className="gig-title">{gig.title}</h3>
                        <p className="gig-desc">{gig.shortDesc}</p>
                        <div className="gig-footer">
                          <div className="gig-rating">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="currentColor"/>
                            </svg>
                            <span>
                              {gig.starNumber > 0 
                                ? (gig.totalStars / gig.starNumber).toFixed(1) 
                                : "New"}
                              {gig.starNumber > 0 && ` (${gig.starNumber})`}
                            </span>
                          </div>
                          <div className="gig-price">From ${gig.price}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-services">
                  <p>
                    {isOwnProfile 
                      ? "You haven't created any services yet." 
                      : `${userData.username} hasn't created any services yet.`}
                  </p>
                  {isOwnProfile && (
                    <Link to="/add" className="add-service-btn">
                      Create a Service
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* GitHub Tab - Only visible for freelancers with GitHub connected */}
          {activeTab === 'github' && userData.isSeller && userData.githubUsername && (
            <div className="github-section">
              <h2 className="section-title">GitHub Projects</h2>
              
              <div className="github-profile-card">
                <div className="github-header">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill={darkMode ? "#f0f6fc" : "#24292e"}/>
                  </svg>
                  <h3>
                    <a 
                      href={`https://github.com/${userData.githubUsername}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {userData.githubUsername}
                    </a>
                  </h3>
                </div>
                
                <div className="github-content">
                  <p>View {userData.username}'s projects and contributions on GitHub.</p>
                  <div className="github-links">
                    <a 
                      href={`https://github.com/${userData.githubUsername}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="github-btn"
                    >
                      View Profile
                    </a>
                    <a 
                      href={`https://github.com/${userData.githubUsername}?tab=repositories`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="github-btn secondary"
                    >
                      View Repositories
                    </a>
                  </div>
                </div>
                
                <div className="github-iframe-wrapper">
                  <iframe 
                    src={`https://github-readme-stats.vercel.app/api?username=${userData.githubUsername}&show_icons=true&theme=${darkMode ? 'dark' :'default'}&hide_border=true&count_private=true`}
                    frameBorder="0"
                    scrolling="no"
                    width="100%"
                    height="200"
                    title={`${userData.username}'s GitHub stats`}
                  ></iframe>
                </div>
                
                <div className="github-footer">
                  <small>
                    GitHub integration helps freelancers showcase their coding skills and project contributions to potential clients.
                  </small>
                </div>
              </div>
            </div>
          )}
          
          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <h2 className="section-title">
                Reviews {reviewsData ? `(${reviewsData.length})` : ''}
              </h2>
              
              {isLoadingReviews ? (
                <div className="loading-reviews">Loading reviews...</div>
              ) : reviewsError ? (
                <div className="error-reviews">
                  {reviewsError.response?.status === 404 
                    ? "No reviews found" 
                    : `Error loading reviews: ${reviewsError.response?.data || reviewsError.message}`}
                </div>
              ) : reviewsData && reviewsData.length > 0 ? (
                <div className="reviews-list">
                  {reviewsData.map((review) => (
                    <ReviewItem key={review._id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="empty-reviews">
                  <p>
                    {isOwnProfile 
                      ? "You haven't received any reviews yet." 
                      : `${userData.username} hasn't received any reviews yet.`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* GitHub Notification for Freelancers - Only shown to freelancers without GitHub connected */}
      {isOwnProfile && userData.isSeller && !userData.githubUsername && (
        <div className="github-notification">
          <div className="notification-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor"/>
            </svg>
            <div className="notification-text">
              <p>Connect your GitHub account to showcase your projects and contributions to potential clients.</p>
              <Link to="/myprofile" className="github-link-btn">
                Connect GitHub Account
              </Link>
            </div>
            <button className="close-notification" onClick={closeGithubNotification}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;