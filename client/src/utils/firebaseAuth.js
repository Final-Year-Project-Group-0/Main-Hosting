// src/utils/firebaseAuth.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  linkWithPopup,
  unlink
} from "firebase/auth";
import newRequest from "./newRequest";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSgJlKwoONkM3SompHSFSYkb-hNT8ECOY",
  authDomain: "freelancify-568fe.firebaseapp.com",
  projectId: "freelancify-568fe",
  storageBucket: "freelancify-568fe.firebasestorage.app",
  messagingSenderId: "6405282146",
  appId: "1:6405282146:web:8f175e5237894b4859343b",
  measurementId: "G-Q6X0HJG55D"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// Provider instances
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Add specific scopes
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Add GitHub scopes for repository access and user info
githubProvider.addScope('user');
githubProvider.addScope('repo');

// Sign in with Google - check if user exists
export const signInWithGoogle = async (isRegistration = false) => {
  try {
    console.log("Starting Google sign-in process");
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    console.log("Google auth successful for:", user.email);

    // Get the token
    const idToken = await user.getIdToken();

    // Send to our backend
    console.log("Sending request to backend");
    try {
      const response = await newRequest.post('firebase/auth', {
        idToken,
        email: user.email,
        name: user.displayName,
        photo: user.photoURL,
        isRegistration
      });

      console.log("Backend response:", response.data);

      // If this is a new user registration that needs additional info
      if (response.data.needsAdditionalInfo) {
        // Return the data to be filled into the registration form
        return {
          needsAdditionalInfo: true,
          userData: response.data.userData
        };
      }

      // Otherwise, this is a returning user or login
      // Save user data to localStorage
      localStorage.setItem("currentUser", JSON.stringify(response.data));

      // Trigger an event to update the UI
      window.dispatchEvent(new Event('userLoggedIn'));

      // Redirect to home
      window.location.href = '/';

      return response.data;
    } catch (error) {
      console.error("API request error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

// Complete Google registration with additional info
export const completeGoogleRegistration = async (userData, additionalInfo) => {
  try {
    // Send complete registration data to backend
    const response = await newRequest.post('firebase/complete-registration', {
      userData,
      additionalInfo
    });

    // Save complete user data to localStorage
    localStorage.setItem("currentUser", JSON.stringify(response.data));

    // Trigger an event to update the UI
    window.dispatchEvent(new Event('userLoggedIn'));

    // Redirect to home
    window.location.href = '/';

    return response.data;
  } catch (error) {
    console.error("Error completing registration:", error);
    throw error;
  }
};

// src/utils/firebaseAuth.js - Update the linkGithubAccount function
// Keep everything else in the file the same

// Link GitHub account to existing user account (for freelancers only)
export const linkGithubAccount = async () => {
  try {
    console.log("Starting GitHub account linking process");

    // Check if user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("You must be logged in to link your GitHub account");
    }

    // Get the user data from localStorage to check if they're a seller
    const userData = JSON.parse(localStorage.getItem("currentUser"));
    if (!userData || !userData.isSeller) {
      throw new Error("Only freelancer accounts can link GitHub profiles");
    }

    try {
      // Use a direct GitHub OAuth flow instead of Firebase linking
      // This avoids the email conflict issue
      
      // Get GitHub OAuth URL from your backend
      console.log("Getting GitHub OAuth URL...");
      const authUrlResponse = await newRequest.get('/firebase/github-auth-url');
      const githubAuthUrl = authUrlResponse.data.url;
      
      // Open GitHub auth in popup window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      // Store the current user ID in localStorage for the callback
      localStorage.setItem('github_auth_user_id', userData._id);
      
      // Open the popup window
      const popup = window.open(
        githubAuthUrl,
        'githubAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      // Handle popup closed manually
      const checkPopupClosed = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(checkPopupClosed);
          console.log("GitHub authentication window closed");
        }
      }, 1000);
      
      // Create event listener for the callback
      console.log("Waiting for GitHub authentication...");
      
      // Return a promise that will be resolved when authentication completes
      return new Promise((resolve, reject) => {
        const messageHandler = (event) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'github-auth-success') {
            console.log("GitHub auth success:", event.data);
            const { githubUsername } = event.data;
            
            clearInterval(checkPopupClosed);
            window.removeEventListener('message', messageHandler);
            
            // Send to our backend to update the user profile
            console.log("Updating user profile with GitHub username:", githubUsername);
            newRequest.post('firebase/github-link', {
              userId: userData._id,
              githubUsername: githubUsername
            })
              .then(response => {
                console.log("Backend response:", response.data);
                
                // Update localStorage
                localStorage.setItem("currentUser", JSON.stringify(response.data));
                
                // Trigger an event to update the UI
                window.dispatchEvent(new Event('userProfileUpdated'));
                
                resolve({
                  success: true,
                  message: "GitHub account successfully linked",
                  user: response.data
                });
              })
              .catch(err => {
                console.error("Error updating profile:", err);
                reject(err);
              });
          }
          
          if (event.data.type === 'github-auth-error') {
            console.error("GitHub auth error:", event.data.error);
            clearInterval(checkPopupClosed);
            window.removeEventListener('message', messageHandler);
            reject(new Error(event.data.error || "GitHub authentication failed"));
          }
        };
        
        window.addEventListener('message', messageHandler);
      });
      
    } catch (error) {
      console.error("GitHub auth error:", error);
      throw error;
    }
  } catch (error) {
    console.error("GitHub account linking error:", error);

    // Handle specific errors
    if (error.code === 'auth/credential-already-in-use') {
      throw new Error("This GitHub account is already linked to another user");
    }

    throw error;
  }
};

// Unlink GitHub account
export const unlinkGithubAccount = async () => {
  try {
    console.log("Starting GitHub account unlinking process");

    // Check if user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("You must be logged in to unlink your GitHub account");
    }

    // Find the provider to unlink
    const providerId = 'github.com';

    // Unlink the provider
    await unlink(currentUser, providerId);
    console.log("GitHub provider unlinked from Firebase auth");

    // Get updated ID token
    const idToken = await currentUser.getIdToken();

    // Notify backend
    console.log("Sending GitHub unlink request to backend");
    const response = await newRequest.post('firebase/github-unlink', { idToken });

    // Update localStorage
    localStorage.setItem("currentUser", JSON.stringify(response.data));

    // Trigger an event to update the UI
    window.dispatchEvent(new Event('userProfileUpdated'));

    return {
      success: true,
      message: "GitHub account successfully unlinked",
      user: response.data
    };
  } catch (error) {
    console.error("GitHub account unlinking error:", error);
    throw error;
  }
};

// Send email verification for non-OAuth users
export const sendEmailVerification = async (email) => {
  try {
    console.log("Sending email verification request");
    const response = await newRequest.post('firebase/send-verification', { email });
    return response.data;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

// Verify email with code for non-OAuth users
export const verifyEmail = async (email, code) => {
  try {
    console.log("Sending email verification confirmation");
    const response = await newRequest.post('firebase/verify-email', {
      email,
      verificationCode: code
    });

    // If verification is successful, store the user in localStorage
    if (response.data && !response.data.error) {
      localStorage.setItem("currentUser", JSON.stringify(response.data));

      // Trigger an event to update the UI
      window.dispatchEvent(new Event('userLoggedIn'));
    }

    return response.data;
  } catch (error) {
    console.error("Error verifying email:", error);
    throw error;
  }
};