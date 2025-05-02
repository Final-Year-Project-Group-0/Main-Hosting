import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Orders.scss";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

const Orders = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");

  // Listen for dark mode changes
  useEffect(() => {
    const updateDarkMode = () => {
      setDarkMode(localStorage.getItem("darkMode") === "true");
    };

    window.addEventListener("storage", updateDarkMode);
    window.addEventListener("darkModeChange", updateDarkMode);

    return () => {
      window.removeEventListener("storage", updateDarkMode);
      window.removeEventListener("darkModeChange", updateDarkMode);
    };
  }, []);

  // Fetch gig orders
  const {
    isLoading: ordersLoading,
    error: ordersError,
    data: ordersData,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: () => newRequest.get(`/orders`).then((res) => res.data),
  });

  // Fetch all jobs to filter bids for sellers
  const {
    isLoading: jobsLoading,
    error: jobsError,
    data: jobsData,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => newRequest.get(`/jobs`).then((res) => res.data),
    enabled: !!currentUser?.isSeller, // Only fetch if user is a seller
  });

  // Filter out the jobs where the current seller has placed bids
  const sellerActiveBids = React.useMemo(() => {
    if (!currentUser?.isSeller || !jobsData) return [];

    // Process all jobs to find seller's bids
    return jobsData.reduce((activeBids, job) => {
      // Only include jobs that are in progress and have not been completed
      if (job.status !== "completed") {
        // Find bids from current seller that are accepted
        const userBids =
          job.bids?.filter(
            (bid) =>
              bid.sellerId === currentUser._id && bid.status === "accepted"
          ) || [];

        // Add job info along with the bid info
        userBids.forEach((bid) => {
          activeBids.push({
            jobId: job._id,
            jobTitle: job.title,
            jobStatus: job.status,
            clientId: job.userId,
            bidId: bid._id,
            price: bid.price,
            deliveryTime: bid.deliveryTime,
            createdAt: bid.createdAt,
          });
        });
      }

      return activeBids;
    }, []);
  }, [currentUser, jobsData]);

  // Fetch client details for job bids
  const { data: clientsData } = useQuery({
    queryKey: ["jobClients", sellerActiveBids],
    queryFn: async () => {
      // Extract unique client IDs
      const clientIds = [
        ...new Set(sellerActiveBids.map((bid) => bid.clientId)),
      ];

      // If no clients, return empty object
      if (clientIds.length === 0) return {};

      // Fetch all clients in parallel
      const clientPromises = clientIds.map((clientId) =>
        newRequest
          .get(`/users/${clientId}`)
          .then((res) => ({ id: clientId, data: res.data }))
      );

      const results = await Promise.all(clientPromises);

      // Create a map of client ID to client data
      return results.reduce((acc, { id, data }) => {
        acc[id] = data;
        return acc;
      }, {});
    },
    enabled: sellerActiveBids.length > 0,
  });

  const handleContact = async (order) => {
    const sellerId = order.sellerId;
    const buyerId = order.buyerId;
    const id = sellerId + buyerId;

    try {
      const res = await newRequest.get(`/conversations/single/${id}`);
      navigate(`/message/${res.data.id}`);
    } catch (err) {
      if (err.response?.status === 404) {
        const res = await newRequest.post(`/conversations/`, {
          to: currentUser.isSeller ? buyerId : sellerId,
        });
        navigate(`/message/${res.data.id}`);
      }
    }
  };

  // Handle contacting client from job proposals
  const handleContactClient = async (clientId) => {
    const sellerId = currentUser._id;
    const buyerId = clientId;
    const id = sellerId + buyerId;

    try {
      const res = await newRequest.get(`/conversations/single/${id}`);
      navigate(`/message/${res.data.id}`);
    } catch (err) {
      if (err.response?.status === 404) {
        const res = await newRequest.post(`/conversations/`, {
          to: buyerId,
        });
        navigate(`/message/${res.data.id}`);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate delivery date based on creation date and delivery time in days
  const calculateDeliveryDate = (createdAt, deliveryDays) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + deliveryDays);
    return formatDate(date);
  };

  // Loading states
  const isLoading = activeTab === "orders" ? ordersLoading : jobsLoading;
  const error = activeTab === "orders" ? ordersError : jobsError;
  const data = activeTab === "orders" ? ordersData : null;

  // Empty state check
  const isEmptyState =
    (activeTab === "orders" && (!data || data.length === 0)) ||
    (activeTab === "proposals" &&
      (!sellerActiveBids || sellerActiveBids.length === 0));

  // Render loading state
  if (isLoading) {
    return (
      <div className={`orders ${darkMode ? "dark-mode" : ""}`}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your {activeTab}...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`orders ${darkMode ? "dark-mode" : ""}`}>
        <div className="error">
          <p>
            {error.response?.data ||
              `There was an error loading your ${activeTab}. Please try again later.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`orders ${darkMode ? "dark-mode" : ""}`}>
      <div className="container">
        <div className="title">
          <h1>Orders & Proposals</h1>

          {/* Tabs for switching between orders and proposals */}
          {currentUser?.isSeller && (
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V6H20V18Z"
                    fill="currentColor"
                  />
                  <path
                    d="M6 10H8V12H6V10ZM6 14H8V16H6V14ZM6 6H8V8H6V6ZM10 10H18V12H10V10ZM10 14H18V16H10V14ZM10 6H18V8H10V6Z"
                    fill="currentColor"
                  />
                </svg>
                Gig Orders
              </button>
              <button
                className={`tab-btn ${
                  activeTab === "proposals" ? "active" : ""
                }`}
                onClick={() => setActiveTab("proposals")}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6H4C2.9 6 2 6.9 2 8V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V8C22 6.9 21.1 6 20 6ZM20 20H4V8H20V20Z"
                    fill="currentColor"
                  />
                  <path
                    d="M7 13C8.1 13 9 12.1 9 11C9 9.9 8.1 9 7 9C5.9 9 5 9.9 5 11C5 12.1 5.9 13 7 13Z"
                    fill="currentColor"
                  />
                  <path
                    d="M11 17H14V15H11V17ZM11 13H17V11H11V13Z"
                    fill="currentColor"
                  />
                  <path
                    d="M14 4L12 2L10 4L8 2H4C2.9 2 2 2.9 2 4V6H22V4C22 2.9 21.1 2 20 2H16L14 4Z"
                    fill="currentColor"
                  />
                </svg>
                Job Proposals
              </button>
            </div>
          )}
        </div>

        {/* Empty state */}
        {isEmptyState && (
          <div className="empty-state">
            <div className="empty-icon">
              {activeTab === "orders" ? "📦" : "📝"}
            </div>
            <h3>
              No {activeTab === "orders" ? "Orders" : "Active Proposals"} Yet
            </h3>
            <p>
              {activeTab === "orders"
                ? "You don't have any orders at the moment. Browse services to find what you need."
                : "You don't have any active job proposals at the moment. Browse open jobs to submit proposals."}
            </p>
            <Link
              to={activeTab === "orders" ? "/gigs" : "/jobs"}
              className="browse-btn"
            >
              {activeTab === "orders" ? "Browse Services" : "Browse Jobs"}
            </Link>
          </div>
        )}

        {/* Gig Orders Table */}
        {activeTab === "orders" && data && data.length > 0 && (
          <div className="orders-table">
            <h2 className="section-title">Gig Orders</h2>
            <table>
              <thead>
                <tr>
                  <th>
                    <center>Image</center>
                  </th>
                  <th>
                    <center>Title</center>
                  </th>
                  <th>
                    <center>Price</center>
                  </th>
                  <th>
                    <center>Contact</center>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <img
                        className="image"
                        src={order.img || "/img/noavatar.jpg"}
                        alt={order.title}
                        onError={(e) => {
                          e.target.src = "/img/noavatar.jpg";
                        }}
                      />
                    </td>
                    <td>
                      <div className="order-title">{order.title}</div>
                      <div className="order-date">
                        Ordered on {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td>${order.price.toFixed(2)}</td>
                    <td>
                      <button
                        className="contact-btn"
                        onClick={() => handleContact(order)}
                        title="Contact seller"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4 4H20V16H5.17L4 17.17V4ZM4 2C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2H4ZM6 12H18V14H6V12ZM6 9H18V11H6V9ZM6 6H18V8H6V6Z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Job Proposals Table */}
        {activeTab === "proposals" &&
          currentUser?.isSeller &&
          sellerActiveBids.length > 0 && (
            <div className="proposals-table">
              <h2 className="section-title">Active Job Proposals</h2>
              <table>
                <thead>
                  <tr>
                    <th>
                      <center>Job Title</center>
                    </th>
                    <th>
                      <center>Client</center>
                    </th>
                    <th>
                      <center>Status</center>
                    </th>
                    <th>
                      <center>Bid Price</center>
                    </th>
                    <th>
                      <center>Expected Delivery</center>
                    </th>
                    <th>
                      <center>Action</center>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sellerActiveBids.map((bid) => (
                    <tr key={`${bid.jobId}-${bid.bidId}`}>
                      <td>
                        <div className="job-title">{bid.jobTitle}</div>
                      </td>
                      <td>
                        {clientsData && clientsData[bid.clientId] ? (
                          <div className="client-info">
                            <img
                              src={
                                clientsData[bid.clientId].img ||
                                "/img/noavatar.jpg"
                              }
                              alt={clientsData[bid.clientId].username}
                              className="client-avatar"
                            />
                            <span>{clientsData[bid.clientId].username}</span>
                          </div>
                        ) : (
                          <span>Loading client...</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${bid.jobStatus}`}>
                          {bid.jobStatus.replace("-", " ")}
                        </span>
                      </td>
                      <td>${bid.price.toFixed(2)}</td>
                      <td>
                        {calculateDeliveryDate(bid.createdAt, bid.deliveryTime)}
                      </td>
                      <td>
                        <button
                          className="contact-btn"
                          onClick={() => handleContactClient(bid.clientId)}
                          title="Contact client"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z"
                              fill="currentColor"
                            />
                            <path
                              d="M11 12H13V14H11V12ZM11 6H13V10H11V6Z"
                              fill="currentColor"
                            />
                          </svg>
                          <span>Message Client</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
};

export default Orders;
