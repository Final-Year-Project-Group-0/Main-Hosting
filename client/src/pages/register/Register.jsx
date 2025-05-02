// import React, { useState, useEffect } from "react";
// import uploadImage, { uploadMultipleCertifications } from "../../utils/upload";
// import "./Register.scss";
// import newRequest from "../../utils/newRequest";
// import { useNavigate, Link } from "react-router-dom";
// import { signInWithGoogle } from "../../utils/firebaseAuth";

// function Register() {
//   const [file, setFile] = useState(null);
//   const [certFiles, setCertFiles] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [error, setError] = useState(null);
//   const [usernameError, setUsernameError] = useState("");
  
//   // State to track if we're in Google auth completion phase
//   const [googleAuthData, setGoogleAuthData] = useState(null);
  
//   const [user, setUser] = useState({
//     username: "",
//     email: "",
//     password: "",
//     img: "",
//     country: "",
//     isSeller: false,
//     desc: "",
//     phone: "",
//     certifications: [],
//   });

//   const navigate = useNavigate();

//   // Check if username is available
//   const checkUsername = async (username) => {
//     if (!username || username.length < 3) return;
    
//     try {
//       const response = await newRequest.get(`/users/check-username/${username}`);
//       return true; // Username is available
//     } catch (err) {
//       if (err.response?.status === 409) {
//         setUsernameError("This username is already taken. Please choose another one.");
//         return false;
//       }
//       return true; // Assume available if other error
//     }
//   };

//   // Hide navbar and footer when register page mounts, restore when unmounts
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

//   const handleChange = async (e) => {
//     const { name, value } = e.target;
    
//     if (name === "username") {
//       setUsernameError("");
//       // Only check if username is at least 3 characters long
//       if (value.length >= 3) {
//         await checkUsername(value);
//       }
//     }
    
//     setUser((prev) => {
//       return { ...prev, [name]: value };
//     });
//   };

//   const handleSeller = (e) => {
//     const isSeller = e.target.checked;
    
//     // If we're in Google auth completion mode, update that state
//     if (googleAuthData) {
//       setGoogleAuthData({
//         ...googleAuthData,
//         isSeller
//       });
//     } else {
//       // Otherwise update normal user state
//       setUser((prev) => {
//         return { ...prev, isSeller };
//       });
//     }
//   };

//   const handleCertificationsChange = (e) => {
//     // Store the selected files
//     setCertFiles(e.target.files);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setUploading(true);
//     setError(null);
    
//     // If we're completing Google auth
//     if (googleAuthData) {
//       // Validate required fields for Google auth completion
//       if (!googleAuthData.username || !googleAuthData.country) {
//         setError("Please fill in all required fields");
//         setUploading(false);
//         return;
//       }
      
//       // Check if username is available
//       const isUsernameAvailable = await checkUsername(googleAuthData.username);
//       if (!isUsernameAvailable) {
//         setUploading(false);
//         return;
//       }
      
//       try {
//         // Step 1: Upload profile image if user changed it
//         let imgUrl = googleAuthData.photo;
//         if (file) {
//           imgUrl = await uploadImage(file);
//         }
        
//         // Step 2: Upload certifications if user is a seller and has added certifications
//         let certificationUrls = [];
//         if (googleAuthData.isSeller && certFiles.length > 0) {
//           certificationUrls = await uploadMultipleCertifications(certFiles);
//         }
        
//         // Step 3: Complete Google registration
//         const response = await newRequest.post("/firebase/complete-registration", {
//           userData: {
//             email: googleAuthData.email,
//             name: googleAuthData.name,
//             photo: imgUrl || googleAuthData.photo
//           },
//           additionalInfo: {
//             username: googleAuthData.username,
//             country: googleAuthData.country,
//             isSeller: googleAuthData.isSeller,
//             phone: googleAuthData.phone || "",
//             desc: googleAuthData.desc || "",
//             certifications: certificationUrls
//           }
//         });
        
//         // Save user data to localStorage
//         localStorage.setItem("currentUser", JSON.stringify(response.data));
        
//         // Navigate to the homepage
//         navigate("/");
//       } catch (err) {
//         setError(err.response?.data || "Something went wrong during registration");
//         console.log(err);
//       } finally {
//         setUploading(false);
//       }
      
//       return;
//     }
    
//     // Regular registration flow
//     // Validate required fields
//     if (!user.username || !user.email || !user.password || !user.country) {
//       setError("Please fill in all required fields");
//       setUploading(false);
//       return;
//     }
    
//     // Check if username is available
//     const isUsernameAvailable = await checkUsername(user.username);
//     if (!isUsernameAvailable) {
//       setUploading(false);
//       return;
//     }

//     try {
//       // Step 1: Upload profile image
//       const imgUrl = file ? await uploadImage(file) : "";

//       // Step 2: Upload certifications if user is a seller and has added certifications
//       let certificationUrls = [];
//       if (user.isSeller && certFiles.length > 0) {
//         certificationUrls = await uploadMultipleCertifications(certFiles);
//       }

//       // Step 3: Register the user with all data
//       const registerRes = await newRequest.post("/auth/register", {
//         ...user,
//         img: imgUrl,
//         certifications: certificationUrls,
//       });

//       // Step 4: Automatically log in the user
//       const loginRes = await newRequest.post("/auth/login", {
//         username: user.username,
//         password: user.password,
//       });

//       // Save user data to localStorage
//       localStorage.setItem("currentUser", JSON.stringify(loginRes.data));

//       // Navigate to the homepage
//       navigate("/");
//     } catch (err) {
//       setError(err.response?.data || "Something went wrong during registration");
//       console.log(err);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleGoogleRegister = async () => {
//     try {
//       setError(null);
//       setUploading(true);
//       const result = await signInWithGoogle(true); // Pass true to indicate registration
      
//       if (result?.needsAdditionalInfo) {
//         // Instead of navigating to a new page, show the completion form on this page
//         setGoogleAuthData({
//           email: result.userData.email,
//           name: result.userData.name,
//           photo: result.userData.photo,
//           idToken: result.userData.idToken,
//           username: result.userData.suggestedUsername || "",
//           country: "",
//           isSeller: false,
//           phone: "",
//           desc: ""
//         });
//       }
//       // If no additionalInfo needed, the function will redirect to home
//     } catch (err) {
//       setError("Failed to sign up with Google: " + (err.message || "Unknown error"));
//     } finally {
//       setUploading(false);
//     }
//   };
  
//   const handleGoogleFormChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name === "username") {
//       setUsernameError("");
//       // Only check if username is at least 3 characters long
//       if (value.length >= 3) {
//         checkUsername(value);
//       }
//     }
    
//     setGoogleAuthData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   return (
//     <div className="register">
//       <button className="back-button" onClick={handleBackClick} aria-label="Go back to home">
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//           <path d="M19 12H5M12 19l-7-7 7-7"/>
//         </svg>
//       </button>
      
//       <div className="register-content">
//         <h1>{googleAuthData ? "Complete Your Profile" : "Create an Account"}</h1>
        
//         {error && <div className="error-message">{error}</div>}
        
//         {googleAuthData ? (
//           // Google Auth Completion Form
//           <form onSubmit={handleSubmit}>
//             <div className="user-info">
//               <img src={googleAuthData.photo} alt="Profile" className="profile-image" />
//               <div className="user-details">
//                 <p className="name">{googleAuthData.name}</p>
//                 <p className="email">{googleAuthData.email}</p>
//               </div>
//             </div>
            
//             <div className="input-group">
//               <label>
//                 Username <span className="required">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="username"
//                 value={googleAuthData.username}
//                 onChange={handleGoogleFormChange}
//                 className={usernameError ? 'error-input' : ''}
//                 required
//               />
//               {usernameError && <div className="error-text">{usernameError}</div>}
//             </div>
            
//             <div className="input-group">
//               <label>
//                 Country <span className="required">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="country"
//                 value={googleAuthData.country}
//                 onChange={handleGoogleFormChange}
//                 required
//               />
//             </div>
            
//             <div className="seller-account">
//               <h3>Freelancer Account</h3>
//               <p>Want to offer services? Activate seller features</p>
//               <div className="toggle-container">
//                 <label>Activate seller account</label>
//                 <label className="toggle">
//                   <input 
//                     type="checkbox"
//                     checked={googleAuthData.isSeller}
//                     onChange={handleSeller}
//                   />
//                   <span className="slider"></span>
//                 </label>
//               </div>
//             </div>
            
//             {googleAuthData.isSeller && (
//               <div className="seller-fields">
//                 <div className="input-group">
//                   <label>Phone Number</label>
//                   <input
//                     type="text"
//                     name="phone"
//                     placeholder="+1 234 567 89"
//                     value={googleAuthData.phone}
//                     onChange={handleGoogleFormChange}
//                   />
//                 </div>
                
//                 <div className="input-group">
//                   <label>Description</label>
//                   <textarea
//                     name="desc"
//                     placeholder="Tell us about yourself and your skills"
//                     rows="4"
//                     value={googleAuthData.desc}
//                     onChange={handleGoogleFormChange}
//                   ></textarea>
//                 </div>
                
//                 <div className="input-group">
//                   <label>Certifications (Optional)</label>
//                   <input
//                     type="file"
//                     multiple
//                     accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//                     onChange={handleCertificationsChange}
//                   />
//                   <small>Upload one or more certification documents</small>
//                 </div>
//               </div>
//             )}
            
//             <div className="input-group">
//               <label>Profile Picture</label>
//               <input
//                 type="file"
//                 onChange={(e) => setFile(e.target.files[0])}
//               />
//               <small>Upload a custom profile picture or keep your Google one</small>
//             </div>
            
//             <div className="create-account">
//               <button type="submit" disabled={uploading}>
//                 {uploading ? "Creating Account..." : "Complete Registration"}
//               </button>
//             </div>
//           </form>
//         ) : (
//           // Regular Registration Form
//           <form onSubmit={handleSubmit}>
//             <div className="input-group">
//               <label>
//                 Username <span className="required">*</span>
//               </label>
//               <input
//                 name="username"
//                 type="text"
//                 placeholder="Enter a unique username"
//                 value={user.username}
//                 onChange={handleChange}
//                 className={usernameError ? 'error-input' : ''}
//                 required
//               />
//               {usernameError && <div className="error-text">{usernameError}</div>}
//             </div>
            
//             <div className="seller-account">
//               <h3>Freelancer Account</h3>
//               <p>Want to offer services? Activate seller features</p>
//               <div className="toggle-container">
//                 <label>Activate seller account</label>
//                 <label className="toggle">
//                   <input
//                     type="checkbox"
//                     checked={user.isSeller}
//                     onChange={handleSeller}
//                   />
//                   <span className="slider"></span>
//                 </label>
//               </div>
//             </div>
            
//             <div className="input-group">
//               <label>
//                 Email <span className="required">*</span>
//               </label>
//               <input
//                 name="email"
//                 type="email"
//                 placeholder="Your email address"
//                 value={user.email}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
            
//             <div className="input-group">
//               <label>
//                 Profile Picture
//               </label>
//               <input
//                 type="file"
//                 onChange={(e) => setFile(e.target.files[0])}
//               />
//             </div>
            
//             <div className="input-group">
//               <label>
//                 Password <span className="required">*</span>
//               </label>
//               <input
//                 name="password"
//                 type="password"
//                 placeholder="Create a password"
//                 value={user.password}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
            
//             <div className="input-group">
//               <label>
//                 Country <span className="required">*</span>
//               </label>
//               <input
//                 name="country"
//                 type="text"
//                 placeholder="Your country"
//                 value={user.country}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
            
//             {user.isSeller && (
//               <div className="seller-fields">
//                 <div className="input-group">
//                   <label>Phone Number</label>
//                   <input
//                     name="phone"
//                     type="text"
//                     placeholder="+1 234 567 89"
//                     value={user.phone}
//                     onChange={handleChange}
//                   />
//                 </div>
                
//                 <div className="input-group">
//                   <label>Description</label>
//                   <textarea
//                     name="desc"
//                     placeholder="Tell us about yourself and your skills"
//                     rows="4"
//                     value={user.desc}
//                     onChange={handleChange}
//                   ></textarea>
//                 </div>
                
//                 <div className="input-group">
//                   <label>Certifications (Optional)</label>
//                   <input
//                     type="file"
//                     multiple
//                     accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//                     onChange={handleCertificationsChange}
//                   />
//                   <small>Upload one or more certification documents</small>
//                 </div>
//               </div>
//             )}
            
//             <div className="create-account">
//               <button type="submit" disabled={uploading}>
//                 {uploading ? "Creating Account..." : "Create Account"}
//               </button>
//             </div>
            
//             <div className="divider">
//               <span>OR</span>
//             </div>
            
//             <div className="google-button">
//               <button
//                 type="button"
//                 onClick={handleGoogleRegister}
//                 disabled={uploading}
//               >
//                 <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
//                   <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" fill="#4285F4"/>
//                 </svg>
//                 Continue with Google
//               </button>
//             </div>
            
//             <div className="sign-in">
//               Already have an account? <Link to="/login">Sign in</Link>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Register;






import React, { useState, useEffect } from "react";
import uploadImage, { uploadMultipleCertifications } from "../../utils/upload";
import "./Register.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate, Link } from "react-router-dom";
import { signInWithGoogle } from "../../utils/firebaseAuth";

function Register() {
  const [file, setFile] = useState(null);
  const [certFiles, setCertFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState(null);
  const [usernameError, setUsernameError] = useState("");
  
  // State to track if we're in Google auth completion phase
  const [googleAuthData, setGoogleAuthData] = useState(null);
  
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    img: "",
    country: "",
    isSeller: false,
    desc: "",
    phone: "",
    certifications: [],
  });

  const navigate = useNavigate();

  // Check if username is available
  const checkUsername = async (username) => {
    if (!username || username.length < 3) return;
    
    try {
      const response = await newRequest.get(`/users/check-username/${username}`);
      return true; // Username is available
    } catch (err) {
      if (err.response?.status === 409) {
        setUsernameError("This username is already taken. Please choose another one.");
        return false;
      }
      return true; // Assume available if other error
    }
  };

  // Hide navbar and footer when register page mounts, restore when unmounts
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

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    if (name === "username") {
      setUsernameError("");
      // Only check if username is at least 3 characters long
      if (value.length >= 3) {
        await checkUsername(value);
      }
    }
    
    setUser((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleSeller = (e) => {
    const isSeller = e.target.checked;
    
    // If we're in Google auth completion mode, update that state
    if (googleAuthData) {
      setGoogleAuthData({
        ...googleAuthData,
        isSeller
      });
    } else {
      // Otherwise update normal user state
      setUser((prev) => {
        return { ...prev, isSeller };
      });
    }
  };

  const handleCertificationsChange = (e) => {
    // Store the selected files
    setCertFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    
    // If we're completing Google auth
    if (googleAuthData) {
      // Validate required fields for Google auth completion
      if (!googleAuthData.username || !googleAuthData.country) {
        setError("Please fill in all required fields");
        setUploading(false);
        return;
      }
      
      // Check if username is available
      const isUsernameAvailable = await checkUsername(googleAuthData.username);
      if (!isUsernameAvailable) {
        setUploading(false);
        return;
      }
      
      try {
        // Step 1: Upload profile image if user changed it
        let imgUrl = googleAuthData.photo;
        if (file) {
          imgUrl = await uploadImage(file);
        }
        
        // Step 2: Upload certifications if user is a seller and has added certifications
        let certificationUrls = [];
        if (googleAuthData.isSeller && certFiles.length > 0) {
          certificationUrls = await uploadMultipleCertifications(certFiles);
        }
        
        // Step 3: Complete Google registration
        const response = await newRequest.post("/firebase/complete-registration", {
          userData: {
            email: googleAuthData.email,
            name: googleAuthData.name,
            photo: imgUrl || googleAuthData.photo
          },
          additionalInfo: {
            username: googleAuthData.username,
            country: googleAuthData.country,
            isSeller: googleAuthData.isSeller,
            phone: googleAuthData.phone || "",
            desc: googleAuthData.desc || "",
            certifications: certificationUrls
          }
        });
        
        // Save user data to localStorage
        localStorage.setItem("currentUser", JSON.stringify(response.data));
        
        // Navigate to the homepage
        navigate("/");
      } catch (err) {
        setError(err.response?.data || "Something went wrong during registration");
        console.log(err);
      } finally {
        setUploading(false);
      }
      
      return;
    }
    
    // Regular registration flow
    // Validate required fields
    if (!user.username || !user.email || !user.password || !user.country) {
      setError("Please fill in all required fields");
      setUploading(false);
      return;
    }
    
    // Check if username is available
    const isUsernameAvailable = await checkUsername(user.username);
    if (!isUsernameAvailable) {
      setUploading(false);
      return;
    }

    try {
      // Step 1: Upload profile image
      const imgUrl = file ? await uploadImage(file) : "";

      // Step 2: Upload certifications if user is a seller and has added certifications
      let certificationUrls = [];
      if (user.isSeller && certFiles.length > 0) {
        certificationUrls = await uploadMultipleCertifications(certFiles);
      }

      // Step 3: Register the user with all data
      const registerRes = await newRequest.post("/auth/register", {
        ...user,
        img: imgUrl,
        certifications: certificationUrls,
      });

      // Step 4: Automatically log in the user
      const loginRes = await newRequest.post("/auth/login", {
        username: user.username,
        password: user.password,
      });

      // Save user data to localStorage
      localStorage.setItem("currentUser", JSON.stringify(loginRes.data));

      // Navigate to the homepage
      navigate("/");
    } catch (err) {
      setError(err.response?.data || "Something went wrong during registration");
      console.log(err);
    } finally {
      setUploading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setError(null);
      setUploading(true);
      const result = await signInWithGoogle(true); // Pass true to indicate registration
      
      if (result?.needsAdditionalInfo) {
        // Instead of navigating to a new page, show the completion form on this page
        setGoogleAuthData({
          email: result.userData.email,
          name: result.userData.name,
          photo: result.userData.photo,
          idToken: result.userData.idToken,
          username: result.userData.suggestedUsername || "",
          country: "",
          isSeller: false,
          phone: "",
          desc: ""
        });
      }
      // If no additionalInfo needed, the function will redirect to home
    } catch (err) {
      setError("Failed to sign up with Google: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };
  
  const handleGoogleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "username") {
      setUsernameError("");
      // Only check if username is at least 3 characters long
      if (value.length >= 3) {
        checkUsername(value);
      }
    }
    
    setGoogleAuthData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="register">
      <button className="back-button" onClick={handleBackClick} aria-label="Go back to home">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <div className="register-content">
        <h1>{googleAuthData ? "Complete Your Profile" : "Create an Account"}</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        {googleAuthData ? (
          // Google Auth Completion Form
          <form onSubmit={handleSubmit}>
            <div className="user-info">
              <img src={googleAuthData.photo} alt="Profile" className="profile-image" />
              <div className="user-details">
                <p className="name">{googleAuthData.name}</p>
                <p className="email">{googleAuthData.email}</p>
              </div>
            </div>
            
            <div className="input-group">
              <label>
                Username <span className="required">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={googleAuthData.username}
                onChange={handleGoogleFormChange}
                className={usernameError ? 'error-input' : ''}
                required
              />
              {usernameError && <div className="error-text">{usernameError}</div>}
            </div>
            
            <div className="input-group">
              <label>
                Country <span className="required">*</span>
              </label>
              <input
                type="text"
                name="country"
                value={googleAuthData.country}
                onChange={handleGoogleFormChange}
                required
              />
            </div>
            
            <div className="seller-account">
              <h3>Freelancer Account</h3>
              <p>Want to offer services? Activate seller features</p>
              <div className="toggle-container">
                <label>Activate seller account</label>
                <label className="toggle">
                  <input 
                    type="checkbox"
                    checked={googleAuthData.isSeller}
                    onChange={handleSeller}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            
            {googleAuthData.isSeller && (
              <div className="seller-fields">
                <div className="input-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+1 234 567 89"
                    value={googleAuthData.phone}
                    onChange={handleGoogleFormChange}
                  />
                </div>
                
                <div className="input-group">
                  <label>Description</label>
                  <textarea
                    name="desc"
                    placeholder="Tell us about yourself and your skills"
                    rows="4"
                    value={googleAuthData.desc}
                    onChange={handleGoogleFormChange}
                  ></textarea>
                </div>
                
                <div className="input-group">
                  <label>Certifications (Optional)</label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleCertificationsChange}
                  />
                  <small>Upload one or more certification documents</small>
                </div>
              </div>
            )}
            
            <div className="input-group">
              <label>Profile Picture</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <small>Upload a custom profile picture or keep your Google one</small>
            </div>
            
            <div className="create-account">
              <button type="submit" disabled={uploading}>
                {uploading ? "Creating Account..." : "Complete Registration"}
              </button>
            </div>
          </form>
        ) : (
          // Regular Registration Form
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>
                Username <span className="required">*</span>
              </label>
              <input
                name="username"
                type="text"
                placeholder="Enter a unique username"
                value={user.username}
                onChange={handleChange}
                className={usernameError ? 'error-input' : ''}
                required
              />
              {usernameError && <div className="error-text">{usernameError}</div>}
            </div>
            
            <div className="seller-account">
              <h3>Freelancer Account</h3>
              <p>Want to offer services? Activate seller features</p>
              <div className="toggle-container">
                <label>Activate seller account</label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={user.isSeller}
                    onChange={handleSeller}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            
            <div className="input-group">
              <label>
                Email <span className="required">*</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="Your email address"
                value={user.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-group">
              <label>
                Profile Picture
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            
            <div className="input-group">
              <label>
                Password <span className="required">*</span>
              </label>
              <input
                name="password"
                type="password"
                placeholder="Create a password"
                value={user.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-group">
              <label>
                Country <span className="required">*</span>
              </label>
              <input
                name="country"
                type="text"
                placeholder="Your country"
                value={user.country}
                onChange={handleChange}
                required
              />
            </div>
            
            {user.isSeller && (
              <div className="seller-fields">
                <div className="input-group">
                  <label>Phone Number</label>
                  <input
                    name="phone"
                    type="text"
                    placeholder="+1 234 567 89"
                    value={user.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="input-group">
                  <label>Description</label>
                  <textarea
                    name="desc"
                    placeholder="Tell us about yourself and your skills"
                    rows="4"
                    value={user.desc}
                    onChange={handleChange}
                  ></textarea>
                </div>
                
                <div className="input-group">
                  <label>Certifications (Optional)</label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleCertificationsChange}
                  />
                  <small>Upload one or more certification documents</small>
                </div>
              </div>
            )}
            
            <div className="create-account">
              <button type="submit" disabled={uploading}>
                {uploading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <div className="google-button">
              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={uploading}
              >
                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" fill="#4285F4"/>
                </svg>
                Continue with Google
              </button>
            </div>
            
            <div className="sign-in">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;