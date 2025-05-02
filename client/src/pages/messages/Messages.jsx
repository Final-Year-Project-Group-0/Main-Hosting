// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import React, { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import newRequest from "../../utils/newRequest";
// import "./Messages.scss";
// import moment from "moment";

// // Helper function to fetch the user details
// const fetchUser = (userId) => {
//   return newRequest.get(`/users/${userId}`).then((res) => res.data);
// };

// const Messages = () => {
//   const currentUser = JSON.parse(localStorage.getItem("currentUser"));
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();
//   const [darkMode, setDarkMode] = useState(
//     localStorage.getItem("darkMode") === "true" ||
//       window.matchMedia("(prefers-color-scheme: dark)").matches
//   );

//   // Listen for dark mode changes
//   useEffect(() => {
//     const updateDarkMode = () => {
//       setDarkMode(localStorage.getItem("darkMode") === "true");
//     };

//     window.addEventListener('storage', updateDarkMode);
//     window.addEventListener('darkModeChange', updateDarkMode);
    
//     return () => {
//       window.removeEventListener('storage', updateDarkMode);
//       window.removeEventListener('darkModeChange', updateDarkMode);
//     };
//   }, []);

//   // Fetch conversations
//   const { isLoading, error, data } = useQuery({
//     queryKey: ["conversations"],
//     queryFn: () =>
//       newRequest.get(`/conversations`).then((res) => {
//         return res.data;
//       }),
//   });

//   const mutation = useMutation({
//     mutationFn: (id) => {
//       return newRequest.put(`/conversations/${id}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["conversations"]);
//     },
//   });

//   const handleRead = (e, id) => {
//     e.stopPropagation(); // Prevent row click from triggering
//     mutation.mutate(id);
//   };

//   const handleRowClick = (conversationId) => {
//     // Navigate to the individual message page
//     navigate(`/message/${conversationId}`);
//   };

//   // Render loading state
//   if (isLoading) {
//     return (
//       <div className={`messages-page ${darkMode ? 'dark-mode' : ''}`}>
//         <div className="loading">
//           <div className="spinner"></div>
//           <p>Loading your conversations...</p>
//         </div>
//       </div>
//     );
//   }

//   // Render error state
//   if (error) {
//     return (
//       <div className={`messages-page ${darkMode ? 'dark-mode' : ''}`}>
//         <div className="error">
//           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
//             <path d="M12 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//             <circle cx="12" cy="16" r="1" fill="currentColor" />
//           </svg>
//           <p>
//             {error.response?.data || 
//               "There was an error loading your messages. Please try again later."}
//           </p>
//           <button 
//             className="retry-button"
//             onClick={() => queryClient.invalidateQueries(["conversations"])}
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Empty state
//   if (data && data.length === 0) {
//     return (
//       <div className={`messages-page ${darkMode ? 'dark-mode' : ''}`}>
//         <div className="container">
//           <div className="title">
//             <h1>
//               <svg className="title-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z" fill="currentColor"/>
//               </svg>
//               Messages
//             </h1>
//             <div className="header-actions">
//               <button className="refresh-button" onClick={() => queryClient.invalidateQueries(["conversations"])}>
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
//                 </svg>
//               </button>
//             </div>
//           </div>
//           <div className="empty-state">
//             <div className="empty-icon">
//               <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
//                 <path d="M12 11C12.55 11 13 10.55 13 10C13 9.45 12.55 9 12 9C11.45 9 11 9.45 11 10C11 10.55 11.45 11 12 11ZM12 7C12.55 7 13 6.55 13 6C13 5.45 12.55 5 12 5C11.45 5 11 5.45 11 6C11 6.55 11.45 7 12 7ZM12 15C12.55 15 13 14.55 13 14C13 13.45 12.55 13 12 13C11.45 13 11 13.45 11 14C11 14.55 11.45 15 12 15Z" fill="currentColor"/>
//               </svg>
//             </div>
//             <h3>No Messages Yet</h3>
//             <p>When you connect with sellers or buyers, your conversations will appear here.</p>
//             <div className="action-buttons">
//               <Link to="/gigs" className="primary-button">
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
//                 </svg>
//                 Browse Services
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`messages-page ${darkMode ? 'dark-mode' : ''}`}>
//       <div className="container">
//         <div className="title">
//           <h1>
//             <svg className="title-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z" fill="currentColor"/>
//             </svg>
//             Messages
//           </h1>
//           <div className="header-actions">
//             <button className="refresh-button" onClick={() => queryClient.invalidateQueries(["conversations"])}>
//               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
//               </svg>
//             </button>
//           </div>
//         </div>
        
//         <div className="messages-wrapper">
//           <div className="messages-stats">
//             <div className="stat-item">
//               <div className="stat-value">{data.length}</div>
//               <div className="stat-label">
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
//                 </svg>
//                 Conversations
//               </div>
//             </div>
//             <div className="stat-item">
//               <div className="stat-value">
//                 {data.filter(c => 
//                   (currentUser.isSeller && !c.readBySeller) || 
//                   (!currentUser.isSeller && !c.readByBuyer)
//                 ).length}
//               </div>
//               <div className="stat-label">
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V6H20V18ZM18 16H6V14H18V16ZM18 11H6V9H18V11Z" fill="currentColor"/>
//                 </svg>
//                 Unread
//               </div>
//             </div>
//           </div>
          
//           <div className="messages-table">
//             <table>
//               <thead>
//                 <tr>
//                   <th>
//                     {/* {currentUser.isSeller ? (
//                       <>
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                           <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
//                         </svg>
//                         <span>Buyer</span>
//                       </>
//                     ) : (
//                       <>
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                           <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
//                         </svg>
//                         <span>Seller</span>
//                       </>
//                     )} */}
//                                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                           <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
//                         </svg>
//                     <span>User</span>
//                   </th>
//                   <th>
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
//                     </svg>
//                     <span>Last Message</span>
//                   </th>
//                   <th>
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="currentColor"/>
//                     </svg>
//                     <span>Time</span>
//                   </th>
//                   {/* <th>
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="currentColor"/>
//                     </svg>
//                     <span>Action</span>
//                   </th> */}
//                 </tr>
//               </thead>
//               <tbody>
//                 {data.map((c) => (
//                   <tr
//                     className={
//                       ((currentUser.isSeller && !c.readBySeller) ||
//                         (!currentUser.isSeller && !c.readByBuyer)) 
//                         ? "active" : ""
//                     }
//                     key={c.id}
//                     onClick={() => handleRowClick(c.id)}
//                   >
//                     <td>
//                       <div className="user-info">
//                         {currentUser.isSeller ? (
//                           <UserDisplay userId={c.buyerId} />
//                         ) : (
//                           <UserDisplay userId={c.sellerId} />
//                         )}
//                       </div>
//                     </td>
//                     <td className="message-preview">
//                       {c?.lastMessage ? (
//                         <div className="message-content">
//                           <div className="message-icon">
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                               <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM18 14H6V12H18V14ZM18 11H6V9H18V11ZM18 8H6V6H18V8Z" fill="currentColor"/>
//                             </svg>
//                           </div>
//                           <span>
//                             {c.lastMessage.length > 50 
//                               ? `${c.lastMessage.substring(0, 50)}...` 
//                               : c.lastMessage}
//                           </span>
//                         </div>
//                       ) : (
//                         <span className="no-messages">
//                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                             <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
//                             <path d="M12 15C13.1 15 14 14.1 14 13C14 11.9 13.1 11 12 11C10.9 11 10 11.9 10 13C10 14.1 10.9 15 12 15ZM12 7C13.1 7 14 6.1 14 5C14 3.9 13.1 3 12 3C10.9 3 10 3.9 10 5C10 6.1 10.9 7 12 7ZM12 11C13.1 11 14 10.1 14 9C14 7.9 13.1 7 12 7C10.9 7 10 7.9 10 9C10 10.1 10.9 11 12 11Z" fill="currentColor"/>
//                           </svg>
//                           No messages yet
//                         </span>
//                       )}
//                     </td>
//                     <td className="date">
//                       <div className="time-info">
//                         <span className="relative-time">{moment(c.updatedAt).fromNow()}</span>
//                         <span className="actual-time">{moment(c.updatedAt).format('MMM D, h:mm A')}</span>
//                       </div>
//                     </td>
//                     {/* <td>
//                       {((currentUser.isSeller && !c.readBySeller) ||
//                         (!currentUser.isSeller && !c.readByBuyer)) ? (
//                         <button 
//                           className="read-btn"
//                           onClick={(e) => handleRead(e, c.id)}
//                           title="Mark as read"
//                         >
//                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                             <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="currentColor"/>
//                           </svg>
//                           <span>Read</span>
//                         </button>
//                       ) : (
//                         <div className="read-status">
//                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                             <path d="M18 7L16.59 5.59L10.25 11.93L11.66 13.34L18 7ZM22.24 5.59L11.66 16.17L7.48 12L6.07 13.41L11.66 19L23.66 7L22.24 5.59ZM0.41 13.41L6 19L7.41 17.59L1.83 12L0.41 13.41Z" fill="currentColor"/>
//                           </svg>
//                           <span>Read</span>
//                         </div>
//                       )}
//                     </td> */}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Enhanced component to display the username for a userId
// const UserDisplay = ({ userId }) => {
//   const { data, isLoading, error } = useQuery({
//     queryKey: ["user", userId],
//     queryFn: () => fetchUser(userId),
//   });

//   if (isLoading) {
//     return (
//       <div className="user-loading">
//         <div className="user-avatar skeleton"></div>
//         <div className="user-name skeleton"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="user-error">
//         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//           <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="currentColor"/>
//         </svg>
//         <span>User unavailable</span>
//       </div>
//     );
//   }

//   return (
//     <div className="user-display">
//       <div className="user-avatar">
//         <img 
//           src={data.img || "/img/noavatar.jpg"} 
//           alt={data.username}
//           onError={(e) => {
//             e.target.src = "/img/noavatar.jpg";
//           }}
//         />
//         {/* {data.isSeller && <div className="user-badge seller">S</div>}
//         {!data.isSeller && <div className="user-badge buyer">B</div>} */}
//       </div>
//       <div className="user-details">
//         <span className="user-name">{data.username}</span>
//         {/* <span className="user-role">{data.isSeller ? "Seller" : "Buyer"}</span> */}
//       </div>
//     </div>
//   );
// };

// export default Messages;



import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Messages.scss";
import moment from "moment";

// Helper function to fetch the user details
const fetchUser = (userId) => {
  return newRequest.get(`/users/${userId}`).then((res) => res.data);
};

const Messages = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Listen for dark mode changes
  useEffect(() => {
    const updateDarkMode = () => {
      setDarkMode(localStorage.getItem("darkMode") === "true");
    };

    window.addEventListener('storage', updateDarkMode);
    window.addEventListener('darkModeChange', updateDarkMode);
    
    return () => {
      window.removeEventListener('storage', updateDarkMode);
      window.removeEventListener('darkModeChange', updateDarkMode);
    };
  }, []);

  // Fetch conversations
  const { isLoading, error, data } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      newRequest.get(`/conversations`).then((res) => {
        return res.data;
      }),
  });

  const handleRowClick = (conversationId) => {
    // Navigate to the individual message page
    navigate(`/message/${conversationId}`);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className={`messages ${darkMode ? 'dark-mode' : ''}`}>
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`messages ${darkMode ? 'dark-mode' : ''}`}>
        <div className="container">
          <div className="error">
            <p>
              {error.response?.data || 
                "There was an error loading your messages. Please try again later."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data && data.length === 0) {
    return (
      <div className={`messages ${darkMode ? 'dark-mode' : ''}`}>
        <div className="container">
          <div className="title">
            <h1>Messages</h1>
            <div className="tabs">
              <button 
                className="tab-btn active"
                onClick={() => queryClient.invalidateQueries(["conversations"])}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z" fill="currentColor"/>
                </svg>
                <span>All Messages</span>
              </button>
            </div>
          </div>
          
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
                <path d="M12 11C12.55 11 13 10.55 13 10C13 9.45 12.55 9 12 9C11.45 9 11 9.45 11 10C11 10.55 11.45 11 12 11ZM12 7C12.55 7 13 6.55 13 6C13 5.45 12.55 5 12 5C11.45 5 11 5.45 11 6C11 6.55 11.45 7 12 7ZM12 15C12.55 15 13 14.55 13 14C13 13.45 12.55 13 12 13C11.45 13 11 13.45 11 14C11 14.55 11.45 15 12 15Z" fill="currentColor"/>
              </svg>
            </div>
            <h3>No Messages Yet</h3>
            <p>When you connect with sellers or buyers, your conversations will appear here.</p>
            <Link to="/gigs" className="browse-btn">
              Browse Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`messages ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container">
        <div className="title">
          <h1>Messages</h1>
          <div className="tabs">
            <button 
              className="tab-btn active"
              onClick={() => queryClient.invalidateQueries(["conversations"])}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z" fill="currentColor"/>
              </svg>
              <span>All Messages</span>
            </button>
          </div>
        </div>
        
        <h2 className="section-title">Your Conversations</h2>
        
        <div className="messages-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th style={{ paddingLeft: '220px' }}>Last Message</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr
                  key={c.id}
                  className={
                    ((currentUser.isSeller && !c.readBySeller) ||
                      (!currentUser.isSeller && !c.readByBuyer)) 
                      ? "unread" : ""
                  }
                >
                  <td>
                    <UserDisplay userId={currentUser.isSeller ? c.buyerId : c.sellerId} />
                  </td>
                  <td>
                    {c?.lastMessage ? (
                      <div className="message-content">
                        <span className="message-text">
                          {c.lastMessage.length > 50 
                            ? `${c.lastMessage.substring(0, 50)}...` 
                            : c.lastMessage}
                        </span>
                      </div>
                    ) : (
                      <span className="no-messages">No messages yet</span>
                    )}
                  </td>
                  <td>
                    <div className="time-info">
                      <span className="message-date">{moment(c.updatedAt).format('MMM D, YYYY')}</span>
                      <span className="message-time">{moment(c.updatedAt).format('h:mm A')}</span>
                    </div>
                  </td>
                  <td>
                    <button 
                      className="contact-btn"
                      onClick={() => handleRowClick(c.id)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM18 14H6V12H18V14ZM18 11H6V9H18V11ZM18 8H6V6H18V8Z" fill="currentColor"/>
                      </svg>
                      <span>Open Chat</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Enhanced component to display the username for a userId
const UserDisplay = ({ userId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) {
    return (
      <div className="client-info loading">
        <div className="client-avatar skeleton"></div>
        <div className="client-name skeleton"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-info error">
        <span>User unavailable</span>
      </div>
    );
  }

  return (
    <div className="client-info">
      <img 
        src={data.img || "/img/noavatar.jpg"} 
        alt={data.username}
        className="client-avatar"
        onError={(e) => {
          e.target.src = "/img/noavatar.jpg";
        }}
      />
      <div className="client-details">
        <span className="client-name">{data.username}</span>
        <span className="client-type">{data.isSeller ? "Seller" : "Buyer"}</span>
      </div>
    </div>
  );
};

export default Messages;