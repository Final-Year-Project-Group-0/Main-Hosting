// Update your App.jsx to add a special route for GitHub callback
// that renders outside the standard Layout component

import React, { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Home from "./pages/home/Home";
import Footer from "./components/footer/Footer";
import Gigs from "./pages/gigs/Gigs";
import Gig from "./pages/gig/Gig";
import Add from "./pages/add/Add";
import GitHubCallback from "./pages/github-callback/GitHubCallback";
import Orders from "./pages/orders/Orders";
import Messages from "./pages/messages/Messages";
import Message from "./pages/message/Message";
import MyGigs from "./pages/myGigs/MyGigs";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Profile from "./pages/profile/Profile";
import ProfilePage from "./pages/profile/ProfilePage";
import Pay from "./pages/pay/Pay";
import Success from "./pages/success/Success";
import JobPost from "./pages/jobpost/JobPost";
import MyJobs from "./pages/myjobs/MyJobs";
import JobsBrowse from "./pages/jobs/JobsBrowse";
import JobDetail from "./pages/job/JobDetail";
import JobPayment from "./pages/jobpay/JobPayment";
import JobPaymentSuccess from "./pages/jobpaymentsuccess/JobPaymentSuccess";
import GoogleRegister from "./pages/googleRegister/GoogleRegister";
import { RequireAuth, RequireSeller, RequireClient, RedirectIfAuth } from "./utils/RouteProtection";

import "./app.scss";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import ErrorBoundary from "./components/errorBoundary/ErrorBoundary";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1
      },
    },
  });

  const [user, setUser] = useState(null);
  
  // Initialize user from localStorage on app load
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser && currentUser !== "null") {
      try {
        setUser(JSON.parse(currentUser));
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
      }
    }
  }, []);

  // Standard layout that includes Navbar and Footer
  const Layout = () => {
    return (
      <div className="app">
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <Navbar user={user} setUser={setUser} />
            <Outlet context={[user, setUser]} />
            <Footer />
          </ErrorBoundary>
        </QueryClientProvider>  
      </div>
    );
  };

  // Special layoutless wrapper for GitHub callback
  // This ensures the callback page has no navbar or footer
  const NoLayoutWrapper = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <GitHubCallback />
        </ErrorBoundary>
      </QueryClientProvider>
    );
  };

  const router = createBrowserRouter([
    // Special route for GitHub callback without layout
    {
      path: "/github-callback",
      element: <NoLayoutWrapper />,
    },
    // Standard routes with layout
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/myprofile",
          element: <RequireAuth><Profile /></RequireAuth>,
        },
        {
          path: "/profile/:profileId",
          element: <ProfilePage />,
        },
        {
          path: "/gigs",
          element: <Gigs />,
        },
        {
          path: "/gig/:id",
          element: <Gig />,
        },
        {
          path: "/google-register",
          element: <GoogleRegister />,
        },
        {
          path: "/orders",
          element: <RequireAuth><Orders /></RequireAuth>,
        },
        {
          path: "/mygigs",
          element: <RequireSeller><MyGigs /></RequireSeller>,
        },
        {
          path: "/add",
          element: <RequireSeller><Add /></RequireSeller>,
        },
        {
          path: "/messages",
          element: <RequireAuth><Messages /></RequireAuth>,
        },
        {
          path: "/message/:id",
          element: <RequireAuth><Message /></RequireAuth>,
        },
        {
          path: "/register",
          element: <RedirectIfAuth><Register setUser={setUser} /></RedirectIfAuth>,
        },
        {
          path: "/login",
          element: <RedirectIfAuth><Login setUser={setUser} /></RedirectIfAuth>,
        },
        {
          path: "/pay/:id",
          element: <RequireAuth><Pay /></RequireAuth>,
        },
        {
          path: "/success",
          element: <RequireAuth><Success /></RequireAuth>,
        },
        {
          path: "/jobpost",
          element: <RequireClient><JobPost /></RequireClient>,
        },
        {
          path: "/myjobs",
          element: <RequireClient><MyJobs /></RequireClient>,
        },
        {
          path: "/jobs",
          element: <JobsBrowse />,
        },
        {
          path: "/job/:id",
          element: <JobDetail />,
        },
        {
          path: "/job-payment/:jobId/:bidId",
          element: <RequireClient><JobPayment /></RequireClient>,
        },  
        {
          path: "/job-payment-success",
          element: <RequireAuth><JobPaymentSuccess /></RequireAuth>,
        },
      ],
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
