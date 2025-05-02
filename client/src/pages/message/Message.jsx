import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import "./Message.css";

const Message = () => {
  const { id } = useParams();
  const [username, setUsername] = useState("");
  const [userImg, setUserImg] = useState("");
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);

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

  // Fetch messages for the selected conversation
  const { isLoading, error, data: messages } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => newRequest.get(`/messages/${id}`).then((res) => res.data),
  });

  // Fetch conversation details
  const { data: conversationData } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => newRequest.get(`/conversations/single/${id}`).then((res) => res.data),
    enabled: !!id,
  });

  // Get the other user in the conversation
  useEffect(() => {
    if (conversationData) {
      const otherUserId = 
        conversationData.sellerId === currentUser._id
          ? conversationData.buyerId
          : conversationData.sellerId;
      
      // Fetch user data for the other participant
      newRequest.get(`/users/${otherUserId}`).then((res) => {
        setUsername(res.data.username);
        setUserImg(res.data.img);
      });
    }
  }, [conversationData, currentUser._id]);

  // Auto-scroll to the most recent message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mutation to send a new message
  const mutation = useMutation({
    mutationFn: (messageData) => {
      return newRequest.post(`/messages`, messageData);
    },
    onSuccess: () => {
      // Auto-fetch messages without using refresh button
      queryClient.invalidateQueries(["messages", id]);
      setMessage("");
    },
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    mutation.mutate({
      conversationId: id,
      desc: message,
    });
  };

  // Format date for messages
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && 
                    date.getMonth() === today.getMonth() && 
                    date.getFullYear() === today.getFullYear();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
  };

  return (
    <div className={`message-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="breadcrumbs-nav">
        <div className="container">
          <Link to="/messages" className="back-link">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M19 12H5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M12 19L5 12L12 5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            Back to Messages
          </Link>
        </div>
      </div>
      
      <div className="message-wrapper">
        <div className="message-header">
          {isLoading ? (
            <div className="conversation-loading">
              <div className="avatar-placeholder"></div>
              <div className="name-placeholder"></div>
            </div>
          ) : (
            <div className="conversation-user">
              <img 
                src={userImg || "/img/noavatar.jpg"} 
                alt={username} 
                className="user-avatar"
              />
              <span className="user-name">{username}</span>
            </div>
          )}
          
          {/* Message actions removed */}
        </div>

        <div className="message-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M12 8V12" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
              <p>Error loading messages. Please try again.</p>
              <button onClick={() => queryClient.invalidateQueries(["messages", id])} className="refresh-button">
                Try Again
              </button>
            </div>
          ) : messages?.length === 0 ? (
            <div className="empty-state">
              <svg 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M8 9H16" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M8 13H14" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <h3>Start the conversation</h3>
              <p>Send a message to begin communicating with {username}.</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages?.map((message) => (
                <div
                  key={message._id}
                  className={`message-item ${message.userId === currentUser._id ? "own" : ""}`}
                >
                  <div className="avatar-container">
                    <img
                      src={message.userId === currentUser._id ? 
                        (currentUser.img || "/img/noavatar.jpg") : 
                        (userImg || "/img/noavatar.jpg")}
                      alt="User avatar"
                      className="message-avatar"
                    />
                  </div>
                  <div className="message-bubble">
                    <p>{message.desc}</p>
                    <span className="message-time">{formatMessageDate(message.createdAt)}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="message-input">
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <textarea
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                className="send-button"
                disabled={mutation.isLoading || !message.trim()}
              >
                {mutation.isLoading ? (
                  <div className="button-spinner"></div>
                ) : (
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M22 2L11 13" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M22 2L15 22L11 13L2 9L22 2Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className="input-helper">
              Press Enter to send, Shift+Enter for new line
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Message;