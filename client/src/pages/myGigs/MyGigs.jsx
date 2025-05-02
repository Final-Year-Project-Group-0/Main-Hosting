import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./MyGigs.scss";
import getCurrentUser from "../../utils/getCurrentUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function MyGigs() {
  const currentUser = getCurrentUser();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { isLoading, error, data } = useQuery({
    queryKey: ["myGigs"],
    queryFn: async () => {
      const response = await newRequest.get(`/gigs?userId=${currentUser._id}`);
      return response.data;
    },
  });
  
  const mutation = useMutation({
    mutationFn: (id) => newRequest.delete(`/gigs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
      setConfirmDelete(null);
    },
  });

  const handleDelete = (id) => {
    setConfirmDelete(id);
  };

  const confirmDeleteGig = (id) => {
    mutation.mutate(id);
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  return (
    <div className="my-gigs-container">
      <div className="my-gigs-wrapper">
        <div className="header">
          <h1>My Gigs</h1>
          {currentUser?.isSeller && (
            <Link to="/add" className="add-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add New Gig
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your gigs...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
            <p>Error loading gigs. Please try again later.</p>
            <button 
              className="retry-button"
              onClick={() => queryClient.invalidateQueries(["myGigs"])}
            >
              Retry
            </button>
          </div>
        ) : data && data.length === 0 ? (
          <div className="empty-gigs">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>You don't have any gigs yet</h2>
            <p>Create your first gig and start offering your services!</p>
            <Link to="/add" className="create-gig-btn">Create a Gig</Link>
          </div>
        ) : (
          <div className="gigs-table-container">
            <table className="gigs-table">
              <thead>
                <tr>
                  <th className="image-column">Image</th>
                  <th className="title-column">Title</th>
                  <th className="price-column">Price</th>
                  <th className="sales-column">Sales</th>
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((gig) => (
                  <tr key={gig._id}>
                    <td className="image-column">
                      <div className="gig-image-container">
                        <img 
                          src={gig.cover} 
                          alt={gig.title} 
                          className="gig-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/img/noimage.jpg";
                          }}
                        />
                      </div>
                    </td>
                    <td className="title-column">
                      <Link to={`/gig/${gig._id}`} className="gig-title-link">
                        {gig.title}
                      </Link>
                    </td>
                    <td className="price-column">${gig.price}</td>
                    <td className="sales-column">{gig.sales}</td>
                    <td className="actions-column">
                      <div className="action-buttons">
                        <Link to={`/gig/${gig._id}`} className="view-button" title="View Gig">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5C5.63636 5 1 12 1 12C1 12 5.63636 19 12 19C18.3636 19 23 12 23 12C23 12 18.3636 5 12 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                        <button 
                          className="delete-button" 
                          onClick={() => handleDelete(gig._id)}
                          title="Delete Gig"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {confirmDelete && (
          <div className="delete-confirmation-overlay">
            <div className="delete-confirmation-modal">
              <h3>Delete Gig</h3>
              <p>Are you sure you want to delete this gig? This action cannot be undone.</p>
              <div className="modal-actions">
                <button className="cancel-button" onClick={cancelDelete}>
                  Cancel
                </button>
                <button 
                  className="confirm-button" 
                  onClick={() => confirmDeleteGig(confirmDelete)}
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyGigs;