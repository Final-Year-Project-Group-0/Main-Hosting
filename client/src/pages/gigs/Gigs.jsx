import React, { useEffect, useState, useRef } from "react";
import "./Gigs.scss";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import GigCard from "../../components/gigCard/GigCard";
import newRequest from "../../utils/newRequest";

function Gigs() {
  const [sort, setSort] = useState("sales");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("");
  const minRef = useRef();
  const maxRef = useRef();
  const navigate = useNavigate();
  const sortOptionsRef = useRef(null);
  
  const { search } = useLocation();
  
  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(search);
    const categoryParam = params.get("cat");
    const searchParam = params.get("search");
    const minParam = params.get("min");
    const maxParam = params.get("max");
    
    if (categoryParam) setCategory(categoryParam);
    if (searchParam) setInput(searchParam);
    if (minParam) minRef.current.value = minParam;
    if (maxParam) maxRef.current.value = maxParam;
  }, [search]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortOptionsRef.current && !sortOptionsRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["gigs"],
    queryFn: () =>
      newRequest
        .get(
          `/gigs?${category ? `cat=${category}&` : ""}${input ? `search=${input}&` : ""}${
            minRef.current?.value ? `min=${minRef.current.value}&` : ""
          }${maxRef.current?.value ? `max=${maxRef.current.value}&` : ""}sort=${sort}`
        )
        .then((res) => {
          return res.data;
        }),
    enabled: true, // Run the query immediately
  });

  // Update URL when filters change
  const updateURL = () => {
    const params = new URLSearchParams();
    if (category) params.append("cat", category);
    if (input) params.append("search", input);
    if (minRef.current?.value) params.append("min", minRef.current.value);
    if (maxRef.current?.value) params.append("max", maxRef.current.value);
    
    navigate(`/gigs?${params.toString()}`);
  };

  const handleSubmit = () => {
    updateURL();
    refetch();
  };

  const reSort = (type) => {
    setSort(type);
    setOpen(false);
  };

  useEffect(() => {
    refetch();
  }, [sort, refetch]);
  
  // Clear filters function
  const clearFilters = () => {
    setInput("");
    setCategory("");
    if (minRef.current) minRef.current.value = "";
    if (maxRef.current) maxRef.current.value = "";
    navigate("/gigs");
    refetch();
  };

  // Get the display name of the category
  const getCategoryDisplayName = (cat) => {
    const categories = {
      "design": "Design",
      "web": "Web Development",
      "animation": "Animation",
      "music": "Music & Audio",
      "writing": "Writing & Translation",
      "video": "Video & Animation",
      "digital-marketing": "Digital Marketing",
      "seo": "SEO"
    };
    return categories[cat] || cat;
  };

  return (
    <div className="gigs">
      <div className="container">
        <div className="breadcrumbs">
          <span>Freelancify</span> / <span>Services</span> {category && `/ ${getCategoryDisplayName(category)}`}
        </div>
        
        <h1>{category ? getCategoryDisplayName(category) : "All Services"}</h1>
        
        <p className="subtitle">
          {category 
            ? `Explore the world of ${getCategoryDisplayName(category)} services tailored to your needs` 
            : "Find the perfect services for your business"}
        </p>
        
        <div className="filters-section">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search services..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={handleSubmit}>Search</button>
          </div>
          
          <div className="menu-filters">
            <div className="filter">
              <span className="filter-label">Budget</span>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="min"
                  ref={minRef}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="max"
                  ref={maxRef}
                />
                <button onClick={handleSubmit}>Apply</button>
              </div>
            </div>
            
            <div className="filter" ref={sortOptionsRef}>
              <span className="filter-label">Sort by</span>
              <div className="sort-selector" onClick={() => setOpen(!open)}>
                <span className="current-sort">
                  {sort === "sales" 
                    ? "Best Selling" 
                    : sort === "createdAt" 
                    ? "Newest" 
                    : "Best Rated"}
                </span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={open ? "open" : ""}>
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                
                {open && (
                  <div className="sort-options">
                    {sort !== "createdAt" && (
                      <span onClick={() => reSort("createdAt")}>Newest</span>
                    )}
                    {sort !== "sales" && (
                      <span onClick={() => reSort("sales")}>Best Selling</span>
                    )}
                    {sort !== "rating" && (
                      <span onClick={() => reSort("rating")}>Best Rated</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {(category || input || minRef.current?.value || maxRef.current?.value) && (
              <button className="clear-filters" onClick={clearFilters}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="cards">
          {isLoading ? (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <span>Loading services...</span>
            </div>
          ) : error ? (
            <div className="error-section">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              <span>Something went wrong! Please try again later.</span>
            </div>
          ) : data.length === 0 ? (
            <div className="empty-results">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 15.5L19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 11C5 14.3137 7.68629 17 11 17C12.6597 17 14.1621 16.3261 15.2483 15.237C16.3308 14.1517 17 12.654 17 11C17 7.68629 14.3137 5 11 5C7.68629 5 5 7.68629 5 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>No results found</h3>
              <p>
                We couldn't find any services matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <button className="reset-btn" onClick={clearFilters}>
                Reset Filters
              </button>
            </div>
          ) : (
            data.map((gig) => <GigCard key={gig._id} item={gig} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default Gigs;