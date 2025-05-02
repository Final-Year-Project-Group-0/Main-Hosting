    // import React from "react";
    // import { Link } from "react-router-dom";
    // import { useQuery } from "@tanstack/react-query";
    // import newRequest from "../../utils/newRequest";

    // const JobCard = ({ job, formatRelativeTime, calculateRemainingDays, currentUser }) => {
    //     // Fetch user/client data for this job
    //     const { isLoading: isLoadingUser, error: userError, data: userData } = useQuery({
    //         queryKey: ["user", job.userId],
    //         queryFn: () => newRequest.get(`/users/${job.userId}`).then((res) => res.data),
    //     });

    //     return (
    //         <div className="job-card">
    //             <div className="job-card-header">
    //                 <div className="job-info">
    //                     <Link to={`/job/${job._id}`} className="job-title">
    //                         {job.title}
    //                     </Link>

    //                     {/* Client info section */}
    //                     <div className="client-info">
    //                         {isLoadingUser ? (
    //                             <div className="client-loading">Loading client...</div>
    //                         ) : userError ? (
    //                             <div className="client-error">Error loading client</div>
    //                         ) : (
    //                             <Link to={`/profile/${job.userId}`} className="client-link">
    //                                 <img
    //                                     src={userData?.img || "/img/noavatar.jpg"}
    //                                     alt={userData?.username}
    //                                     className="client-avatar"
    //                                 />
                                  
                                        
    //                                     <span className="client-name">
    //                                         {userData?.username || 'Client'}
    //                                     </span>
                          
    //                             </Link>
                                
    //                         )}
                           
    //                     </div>
    //                     <br/>

    //                     <div className="job-meta">
    //                         <span className="category-tag">{job.category}</span>
    //                         <span className="job-time">{formatRelativeTime(job.createdAt)}</span>
    //                     </div>
    //                 </div>
    //                 <div className={`job-status status-${job.status}`}>
    //                     {job.status.replace("-", " ")}
    //                 </div>
    //             </div>

    //             <div className="job-description">
    //                 {job.description.length > 200
    //                     ? `${job.description.substring(0, 200)}...`
    //                     : job.description}
    //             </div>

    //             <div className="job-footer">
    //                 <div className="job-details">
    //                     <div className="detail-item">
    //                         <svg
    //                             width="16"
    //                             height="16"
    //                             viewBox="0 0 16 16"
    //                             fill="none"
    //                             xmlns="http://www.w3.org/2000/svg"
    //                         >
    //                             <path
    //                                 d="M8.25 2V14"
    //                                 stroke="currentColor"
    //                                 strokeWidth="1.5"
    //                                 strokeLinecap="round"
    //                                 strokeLinejoin="round"
    //                             />
    //                             <path
    //                                 d="M11.5 4.5C11.5 4.5 10 2 8.25 2C6.5 2 5 4.5 5 4.5"
    //                                 stroke="currentColor"
    //                                 strokeWidth="1.5"
    //                                 strokeLinecap="round"
    //                                 strokeLinejoin="round"
    //                             />
    //                         </svg>
    //                         <span>${job.budget.toFixed(2)}</span>
    //                     </div>
    //                     <div className="detail-item">
    //                         <svg
    //                             width="16"
    //                             height="16"
    //                             viewBox="0 0 16 16"
    //                             fill="none"
    //                             xmlns="http://www.w3.org/2000/svg"
    //                         >
    //                             <path
    //                                 d="M14 4H2V12H14V4Z"
    //                                 stroke="currentColor"
    //                                 strokeWidth="1.5"
    //                                 strokeLinecap="round"
    //                                 strokeLinejoin="round"
    //                             />
    //                             <path
    //                                 d="M4 2V4"
    //                                 stroke="currentColor"
    //                                 strokeWidth="1.5"
    //                                 strokeLinecap="round"
    //                                 strokeLinejoin="round"
    //                             />
    //                             <path
    //                                 d="M12 2V4"
    //                                 stroke="currentColor"
    //                                 strokeWidth="1.5"
    //                                 strokeLinecap="round"
    //                                 strokeLinejoin="round"
    //                             />
    //                             <path
    //                                 d="M2 6H14"
    //                                 stroke="currentColor"
    //                                 strokeWidth="1.5"
    //                                 strokeLinecap="round"
    //                                 strokeLinejoin="round"
    //                             />
    //                         </svg>
    //                         <span>Due in {calculateRemainingDays(job.deadline)}</span>
    //                     </div>
    //                     <div className="detail-item">
    //                         <svg
    //                             width="16"
    //                             height="16"
    //                             viewBox="0 0 16 16"
    //                             fill="none"
    //                             xmlns="http://www.w3.org/2000/svg"
    //                         >
    //                             <path
    //                                 d="M12 14V12C12 10.9391 11.5786 9.92172 10.8284 9.17157C10.0783 8.42143 9.06087 8 8 8H4C2.93913 8 1.92172 8.42143 1.17157 9.17157C0.421427 9.92172 0 10.9391 0 12V14"
    //                                 stroke="currentColor"
    //                                 strokeWidth="1.5"
    //                                 strokeLinecap="round"
    //                                 strokeLinejoin="round"
    //                             />
    //                             <path
    //                                 d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z"
    //                                 stroke="currentColor"
    //                                 strokeWidth="1.5"
    //                                 strokeLinecap="round"
    //                                 strokeLinejoin="round"
    //                             />
    //                         </svg>
    //                         <span>{job.bids?.length || 0} proposals</span>
    //                     </div>
    //                 </div>

    //                 <Link
    //                     to={`/job/${job._id}`}
    //                     className="view-job-btn"
    //                 >
    //                     {currentUser?.isSeller && job.status === "open"
    //                         ? "Submit Proposal"
    //                         : "View Details"}
    //                 </Link>
    //             </div>
    //         </div>
    //     );
    // };

    // export default JobCard;












//     import React from "react";
// import { Link } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import newRequest from "../../utils/newRequest";
// import "./JobCard.scss"; // Make sure to import the stylesheet

// const JobCard = ({ job, formatRelativeTime, calculateRemainingDays, currentUser }) => {
//     // Fetch user/client data for this job
//     const { isLoading: isLoadingUser, error: userError, data: userData } = useQuery({
//         queryKey: ["user", job.userId],
//         queryFn: () => newRequest.get(`/users/${job.userId}`).then((res) => res.data),
//     });

//     return (
//         <div className="job-card">
//             <div className="job-card-header">
//                 <div className="job-info">
//                     {/* Job title with proper CSS classes to ensure single line */}
//                     <Link to={`/job/${job._id}`} className="job-title single-line-title">
//                         {job.title}
//                     </Link>

//                     {/* Client info section */}
//                     <div className="client-info">
//                         {isLoadingUser ? (
//                             <div className="client-loading">Loading client...</div>
//                         ) : userError ? (
//                             <div className="client-error">Error loading client</div>
//                         ) : (
//                             <Link to={`/profile/${job.userId}`} className="client-link">
//                                 <img
//                                     src={userData?.img || "/img/noavatar.jpg"}
//                                     alt={userData?.username}
//                                     className="client-avatar"
//                                 />
//                                 <span className="client-name">
//                                     {userData?.username || 'Client'}
//                                 </span>
//                             </Link>
//                         )}
//                     </div>

//                     <div className="job-meta">
//                         <span className="category-tag">{job.category}</span>
//                         <span className="job-time">{formatRelativeTime(job.createdAt)}</span>
//                     </div>
//                 </div>
//                 <div className={`job-status status-${job.status}`}>
//                     {job.status.replace("-", " ")}
//                 </div>
//             </div>

//             <div className="job-description">
//                 {job.description.length > 200
//                     ? `${job.description.substring(0, 200)}...`
//                     : job.description}
//             </div>

//             <div className="job-footer">
//                 <div className="job-details">
//                     <div className="detail-item">
//                         <svg
//                             width="16"
//                             height="16"
//                             viewBox="0 0 16 16"
//                             fill="none"
//                             xmlns="http://www.w3.org/2000/svg"
//                         >
//                             <path
//                                 d="M8.25 2V14"
//                                 stroke="currentColor"
//                                 strokeWidth="1.5"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                             />
//                             <path
//                                 d="M11.5 4.5C11.5 4.5 10 2 8.25 2C6.5 2 5 4.5 5 4.5"
//                                 stroke="currentColor"
//                                 strokeWidth="1.5"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                             />
//                         </svg>
//                         <span>${job.budget.toFixed(2)}</span>
//                     </div>
//                     <div className="detail-item">
//                         <svg
//                             width="16"
//                             height="16"
//                             viewBox="0 0 16 16"
//                             fill="none"
//                             xmlns="http://www.w3.org/2000/svg"
//                         >
//                             <path
//                                 d="M14 4H2V12H14V4Z"
//                                 stroke="currentColor"
//                                 strokeWidth="1.5"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                             />
//                             <path
//                                 d="M4 2V4"
//                                 stroke="currentColor"
//                                 strokeWidth="1.5"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                             />
//                             <path
//                                 d="M12 2V4"
//                                 stroke="currentColor"
//                                 strokeWidth="1.5"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                             />
//                             <path
//                                 d="M2 6H14"
//                                 stroke="currentColor"
//                                 strokeWidth="1.5"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                             />
//                         </svg>
//                         <span>Due in {calculateRemainingDays(job.deadline)}</span>
//                     </div>
//                     <div className="detail-item">
//                         <svg
//                             width="16"
//                             height="16"
//                             viewBox="0 0 16 16"
//                             fill="none"
//                             xmlns="http://www.w3.org/2000/svg"
//                         >
//                             <path
//                                 d="M12 14V12C12 10.9391 11.5786 9.92172 10.8284 9.17157C10.0783 8.42143 9.06087 8 8 8H4C2.93913 8 1.92172 8.42143 1.17157 9.17157C0.421427 9.92172 0 10.9391 0 12V14"
//                                 stroke="currentColor"
//                                 strokeWidth="1.5"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                             />
//                             <path
//                                 d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z"
//                                 stroke="currentColor"
//                                 strokeWidth="1.5"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                             />
//                         </svg>
//                         <span>{job.bids?.length || 0} proposals</span>
//                     </div>
//                 </div>

//                 <Link
//                     to={`/job/${job._id}`}
//                     className="view-job-btn"
//                 >
//                     {currentUser?.isSeller && job.status === "open"
//                         ? "Submit Proposal"
//                         : "View Details"}
//                 </Link>
//             </div>
//         </div>
//     );
// };

// export default JobCard;









import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import "./JobCard.scss"; // Make sure to use the enhanced stylesheet

const JobCard = ({ job, formatRelativeTime, calculateRemainingDays, currentUser }) => {
    // State for hover effects and animations
    const [isHovered, setIsHovered] = useState(false);
    
    // Fetch user/client data for this job
    const { isLoading: isLoadingUser, error: userError, data: userData } = useQuery({
        queryKey: ["user", job.userId],
        queryFn: () => newRequest.get(`/users/${job.userId}`).then((res) => res.data),
    });

    // Function to format currency with locale
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div 
            className="job-card"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="job-card-header">
                <div className="job-info">
                    {/* Enhanced job title with proper truncation */}
                    <Link to={`/job/${job._id}`} className="job-title single-line-title">
                        {job.title}
                    </Link>

                    {/* Enhanced client info section */}
                    <div className="client-info">
                        {isLoadingUser ? (
                            <div className="client-loading">Loading client info</div>
                        ) : userError ? (
                            <div className="client-error">Error loading client</div>
                        ) : (
                            <Link to={`/profile/${job.userId}`} className="client-link">
                                <img
                                    src={userData?.img || "/img/noavatar.jpg"}
                                    alt={userData?.username}
                                    className="client-avatar"
                                    onError={(e) => {
                                        e.target.src = "/img/noavatar.jpg";
                                    }}
                                />
                                <span className="client-name">
                                    {userData?.username || 'Client'}
                                </span>
                            </Link>
                        )}
                    </div>

                    {/* Enhanced meta information */}
                    <div className="job-meta">
                        <span className="category-tag">{job.category}</span>
                        <span className="job-time">{formatRelativeTime(job.createdAt)}</span>
                    </div>
                </div>
                
                {/* Enhanced status badge */}
                <div className={`job-status status-${job.status}`}>
                    {job.status === "in-progress" ? "In Progress" : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </div>
            </div>

            {/* Enhanced job description with gradient fade */}
            <div className="job-description">
                {job.description}
            </div>

            {/* Enhanced footer with better visual organization */}
            <div className="job-footer">
                <div className="job-details">
                    <div className="detail-item">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2V22M17 7C17 7 14 4 12 4C10 4 7 7 7 7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span>{formatCurrency(job.budget)}</span>
                    </div>
                    
                    <div className="detail-item">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M3 10H21"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <path
                                d="M16 2V6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <path
                                d="M8 2V6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                        <span>Due in {calculateRemainingDays(job.deadline)}</span>
                    </div>
                    
                    <div className="detail-item">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M23 21V19C22.9986 17.1771 21.7315 15.5857 20 15.13"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M16 3.13C17.7336 3.58399 19.0029 5.17856 19.0029 7.005C19.0029 8.83144 17.7336 10.426 16 10.88"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span>
                            {job.bids?.length || 0} {job.bids?.length === 1 ? 'proposal' : 'proposals'}
                        </span>
                    </div>
                </div>

                {/* Enhanced action button with better visual appeal */}
                <Link
                    to={`/job/${job._id}`}
                    className="view-job-btn"
                >
                    {currentUser?.isSeller && job.status === "open"
                        ? "Submit Proposal"
                        : "View Details"}
                </Link>
            </div>
        </div>
    );
};

export default JobCard;