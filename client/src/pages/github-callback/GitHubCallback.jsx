// Updated GitHubCallback.jsx component to ensure successful authentication
// and page refresh in the parent window

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import newRequest from '../../utils/newRequest';
import "./GitHubCallback.scss";

const GitHubCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  // Immediately hide any navbar or layout elements
  useEffect(() => {
    document.body.classList.add('github-callback-page');
    
    return () => {
      document.body.classList.remove('github-callback-page');
    };
  }, []);

  useEffect(() => {
    const completeGithubAuth = async () => {
      try {
        // Extract code and state from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        if (!code) {
          setStatus('failed');
          setError('No authorization code received from GitHub');
          return;
        }
        
        // Get stored user ID (if available)
        const userId = localStorage.getItem('github_auth_user_id');
        
        console.log("Processing GitHub callback:", { code, state, userId });
        setStatus('connecting');
        
        // Call your backend to exchange the code for a token and get user info
        const response = await newRequest.post('/firebase/github-auth-callback', {
          code,
          state,
          userId // Include userId if available for auto-linking
        });
        
        const { githubUsername, autoSaved } = response.data;
        
        if (!githubUsername) {
          throw new Error("No GitHub username received");
        }
        
        setStatus('success');
        
        // Send message to parent window with the result
        if (window.opener && window.opener !== window) {
          window.opener.postMessage({
            type: 'github-auth-success',
            githubUsername,
            autoSaved: autoSaved || false,
            timestamp: Date.now() // Add timestamp to ensure message uniqueness
          }, window.location.origin);
          
          // Close this window after a short delay
          setTimeout(() => {
            window.close();
          }, 1500);
        } else {
          // If no opener window (direct navigation), redirect to profile page
          // and reload to reflect changes
          setTimeout(() => {
            navigate('/myprofile');
          }, 2000);
        }
        
      } catch (err) {
        console.error("GitHub callback error:", err);
        setStatus('failed');
        
        const errorMessage = err.response?.data || err.message || "Authentication failed";
        setError(errorMessage);
        
        // Send error to parent window
        if (window.opener && window.opener !== window) {
          window.opener.postMessage({
            type: 'github-auth-error',
            error: errorMessage
          }, window.location.origin);
          
          // Close this window after showing error
          setTimeout(() => {
            window.close();
          }, 3000);
        }
      }
    };
    
    completeGithubAuth();
  }, [navigate]);

  return (
    <div className="github-callback-page">
      <div className="github-callback-container">
        <div className="github-callback-content">
          <div className="github-logo">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor"/>
            </svg>
          </div>
          
          {status === 'processing' && (
            <>
              <h2>Connecting to GitHub</h2>
              <p>Please wait while we process your GitHub authentication...</p>
              <div className="spinner"></div>
            </>
          )}
          
          {status === 'connecting' && (
            <>
              <h2>Almost There!</h2>
              <p>Linking your GitHub account to your freelancer profile...</p>
              <div className="spinner"></div>
            </>
          )}
          
          {status === 'success' && (
            <>
              <h2>Success!</h2>
              <p>Your GitHub account has been successfully linked.</p>
              <div className="success-icon">✓</div>
              <p className="closing-message">This window will close automatically...</p>
            </>
          )}
          
          {status === 'failed' && (
            <>
              <h2>Authentication Failed</h2>
              <p>{error || "An error occurred while linking your GitHub account."}</p>
              <div className="error-icon">!</div>
              <p className="closing-message">This window will close automatically...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitHubCallback;