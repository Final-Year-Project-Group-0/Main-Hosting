// import React, { useState, useEffect } from "react";
// import "./Login.scss";
// import newRequest from "../../utils/newRequest";
// import { useNavigate, Link, useLocation } from "react-router-dom";
// import { signInWithGoogle } from "../../utils/firebaseAuth";

// function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [showVerification, setShowVerification] = useState(false);
//   const [email, setEmail] = useState("");
//   const [verificationCode, setVerificationCode] = useState("");
//   const [verificationError, setVerificationError] = useState("");

//   const navigate = useNavigate();
//   const location = useLocation();
  
//   // Check if we have email verification query params
//   useEffect(() => {
//     const queryParams = new URLSearchParams(location.search);
//     const verificationEmail = queryParams.get('email');
//     const mode = queryParams.get('mode');
    
//     if (verificationEmail && mode === 'verifyEmail') {
//       setEmail(verificationEmail);
//       setShowVerification(true);
//       // Clean up URL without reloading
//       window.history.replaceState({}, '', '/login');
//     }
//   }, [location]);
  
//   // Hide navbar and footer when login page mounts, restore when unmounts
//   useEffect(() => {
//     // Hide navbar and footer
//     const navbar = document.querySelector('header.navbar');
//     const footer = document.querySelector('footer');
    
//     if (navbar) navbar.style.display = 'none';
//     if (footer) footer.style.display = 'none';
    
//     // Check initial dark mode state
//     const checkDarkMode = () => {
//       const isDark = document.body.classList.contains('dark-mode');
//       setIsDarkMode(isDark);
//     };
    
//     // Add MutationObserver to watch for class changes on body
//     const bodyObserver = new MutationObserver((mutations) => {
//       mutations.forEach((mutation) => {
//         if (mutation.attributeName === 'class') {
//           checkDarkMode();
//         }
//       });
//     });
    
//     // Start observing body for class changes
//     bodyObserver.observe(document.body, { attributes: true });
    
//     // Check initial state
//     checkDarkMode();
    
//     // Cleanup function to restore navbar and footer when component unmounts
//     return () => {
//       if (navbar) navbar.style.display = '';
//       if (footer) footer.style.display = '';
//       bodyObserver.disconnect();
//     };
//   }, []);

//   const handleBackClick = () => {
//     navigate('/');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
    
//     if (!username || !password) {
//       setError("Please fill in all fields");
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const res = await newRequest.post("/auth/login", { username, password });
//       localStorage.setItem("currentUser", JSON.stringify(res.data));
      
//       // Trigger an event to update the UI
//       window.dispatchEvent(new Event('userLoggedIn'));
      
//       navigate("/");
//     } catch (err) {
//       // Check if error is due to unverified email
//       if (err.response?.status === 403 && err.response?.data?.includes("verify your email")) {
//         // Get email address and show verification form
//         try {
//           const userRes = await newRequest.get(`/auth/email/${username}`);
//           if (userRes.data.email) {
//             setEmail(userRes.data.email);
//             setShowVerification(true);
//           }
//         } catch (userErr) {
//           setError(err.response?.data || "Something went wrong");
//         }
//       } else {
//         setError(err.response?.data || "Something went wrong");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleVerificationSubmit = async (e) => {
//     e.preventDefault();
//     setVerificationError("");
    
//     if (!email || !verificationCode) {
//       setVerificationError("Please enter verification code");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
//       const response = await newRequest.post('firebase/verify-email', { 
//         email, 
//         verificationCode: verificationCode 
//       });
      
//       if (response.data) {
//         // Save user data to localStorage
//         localStorage.setItem("currentUser", JSON.stringify(response.data));
        
//         // Trigger an event to update the UI
//         window.dispatchEvent(new Event('userLoggedIn'));
        
//         // Navigate to the homepage
//         navigate("/");
//       }
//     } catch (err) {
//       setVerificationError(err.response?.data || "Invalid verification code");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResendCode = async () => {
//     if (!email) {
//       setVerificationError("Email is required for sending verification code");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
//       const response = await newRequest.post('/auth/resend-verification', { email });
      
//       if (response.data.success) {
//         alert("Verification code has been resent to your email");
//         // If in development environment and code is returned, pre-fill it
//         if (response.data.code) {
//           setVerificationCode(response.data.code);
//         }
//       }
//     } catch (err) {
//       setVerificationError(err.response?.data || "Failed to resend verification code");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleLogin = async () => {
//     try {
//       setError(null);
//       setIsLoading(true);
//       await signInWithGoogle(false); // Pass false to indicate login, not registration
//       // The function will redirect to home on success
//     } catch (err) {
//       setError("Failed to sign in with Google: " + (err.message || "Unknown error"));
//       setIsLoading(false);
//     }
//   };

//   // If showing verification form
//   if (showVerification) {
//     return (
//       <div className={`login ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
//         <button className="back-button" onClick={handleBackClick} aria-label="Go back to home">
//           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M19 12H5M12 19l-7-7 7-7"/>
//           </svg>
//         </button>
        
//         <div className="login-content">
//           <div className="login-form verification-form">
//             <h1>Verify Your Email</h1>
//             <p>Please enter the verification code sent to <strong>{email}</strong></p>
            
//             {verificationError && <div className="error">{verificationError}</div>}
            
//             <form onSubmit={handleVerificationSubmit}>
//               <div className="input-group">
//                 <label htmlFor="verificationCode">Verification Code</label>
//                 <input
//                   id="verificationCode"
//                   name="verificationCode"
//                   type="text"
//                   placeholder="Enter verification code"
//                   value={verificationCode}
//                   onChange={(e) => setVerificationCode(e.target.value)}
//                   required
//                 />
//               </div>
              
//               <button type="submit" disabled={isLoading}>
//                 {isLoading ? "Verifying..." : "Verify Email"}
//               </button>
              
//               <div className="verification-actions">
//                 <button 
//                   type="button" 
//                   className="resend-btn"
//                   onClick={handleResendCode}
//                   disabled={isLoading}
//                 >
//                   Resend verification code
//                 </button>
//               </div>
//             </form>
//           </div>
          
//           <div className="branding">
//             <div className="brand-content">
//               <div className="logo">Freelancify</div>
//               <h2>Your Gateway to Professional Services</h2>
//               <p>Connect with skilled freelancers from around the world and bring your projects to life with our global talent network.</p>
//               <img 
//                 src="/img/global.jpg" 
//                 alt="Global freelance network" 
//                 className="world-image"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`login ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
//       <button className="back-button" onClick={handleBackClick} aria-label="Go back to home">
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//           <path d="M19 12H5M12 19l-7-7 7-7"/>
//         </svg>
//       </button>
      
//       <div className="login-content">
//         <div className="login-form">
//           <h1>Welcome Back</h1>
//           <p>Sign in to access your account</p>
          
//           <form onSubmit={handleSubmit}>
//             <div className="input-group">
//               <label htmlFor="username">Username</label>
//               <input
//                 id="username"
//                 name="username"
//                 type="text"
//                 placeholder="Enter your username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//               />
//             </div>

//             <div className="input-group">
//               <label htmlFor="password">Password</label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
            
//             {error && <div className="error">{error}</div>}
            
//             <button type="submit" disabled={isLoading}>
//               {isLoading ? "Signing in..." : "Sign In"}
//             </button>
            
//             <div className="divider">
//               <span>OR</span>
//             </div>
            
//             <div className="oauth-buttons">
//               <button 
//                 type="button" 
//                 onClick={handleGoogleLogin} 
//                 className="google-login-btn"
//                 disabled={isLoading}
//               >
//                 <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
//                   <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" fill="#4285F4"/>
//                 </svg>
//                 Sign in with Google
//               </button>
//             </div>
            
//             <div className="signup-link">
//               Don't have an account? <Link to="/register">Register now</Link>
//             </div>
//           </form>
//         </div>
        
//         <div className="branding">
//           <div className="brand-content">
//             <div className="logo">Freelancify</div>
//             <h2>Your Gateway to Professional Services</h2>
//             <p>Connect with skilled freelancers from around the world and bring your projects to life with our global talent network.</p>
//             <img 
//               src="/img/global.jpg" 
//               alt="Global freelance network" 
//               className="world-image"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;




import React, { useState, useEffect } from "react";
import "./Login.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { signInWithGoogle } from "../../utils/firebaseAuth";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hide navbar and footer when login page mounts, restore when unmounts
  useEffect(() => {
    // Hide navbar and footer
    const navbar = document.querySelector('header.navbar');
    const footer = document.querySelector('footer');
    
    if (navbar) navbar.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    // Check initial dark mode state
    const checkDarkMode = () => {
      const isDark = document.body.classList.contains('dark-mode');
      setIsDarkMode(isDark);
    };
    
    // Add MutationObserver to watch for class changes on body
    const bodyObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });
    
    // Start observing body for class changes
    bodyObserver.observe(document.body, { attributes: true });
    
    // Check initial state
    checkDarkMode();
    
    // Cleanup function to restore navbar and footer when component unmounts
    return () => {
      if (navbar) navbar.style.display = '';
      if (footer) footer.style.display = '';
      bodyObserver.disconnect();
    };
  }, []);

  const handleBackClick = () => {
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      const res = await newRequest.post("/auth/login", { username, password });
      localStorage.setItem("currentUser", JSON.stringify(res.data));
      
      // Trigger an event to update the UI
      window.dispatchEvent(new Event('userLoggedIn'));
      
      navigate("/");
    } catch (err) {
      setError(err.response?.data || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await signInWithGoogle(false); // Pass false to indicate login, not registration
      // The function will redirect to home on success
    } catch (err) {
      setError("Failed to sign in with Google: " + (err.message || "Unknown error"));
      setIsLoading(false);
    }
  };

  return (
    <div className={`login ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <button className="back-button" onClick={handleBackClick} aria-label="Go back to home">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <div className="login-content">
        <div className="login-form">
          <h1>Welcome Back</h1>
          <p>Sign in to access your account</p>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && <div className="error">{error}</div>}
            
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <div className="oauth-buttons">
              <button 
                type="button" 
                onClick={handleGoogleLogin} 
                className="google-login-btn"
                disabled={isLoading}
              >
                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" fill="#4285F4"/>
                </svg>
                Sign in with Google
              </button>
            </div>
            
            <div className="signup-link">
              Don't have an account? <Link to="/register">Register now</Link>
            </div>
          </form>
        </div>
        
        <div className="branding">
          <div className="brand-content">
            <div className="logo">Freelancify</div>
            <h2>Your Gateway to Professional Services</h2>
            <p>Connect with skilled freelancers from around the world and bring your projects to life with our global talent network.</p>
            <img 
              src="/img/global.jpg" 
              alt="Global freelance network" 
              className="world-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;