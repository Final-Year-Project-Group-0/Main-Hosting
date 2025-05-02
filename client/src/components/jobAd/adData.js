// adData.js - Contains ad data and utility functions

const adsByCategory = {
    // Web Development ads
    "Web Development": [
      {
        id: "wd1",
        title: "Premium Web Hosting - First 3 months FREE",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop",
        link: "/services/web-hosting",
      },
      {
        id: "wd2",
        title: "Professional WordPress Themes - 50% Off",
        image: "https://images.unsplash.com/photo-1561736778-92e52a7769ef?q=80&w=2070&auto=format&fit=crop",
        link: "/themes/wordpress",
      }
    ],
    
    // Graphic Design ads
    "Graphic Design": [
      {
        id: "gd1",
        title: "Premium Stock Photos - Unlimited Downloads",
        image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2071&auto=format&fit=crop",
        link: "/stock-photos",
      },
      {
        id: "gd2",
        title: "Adobe Creative Cloud - Special Offer",
        image: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?q=80&w=2070&auto=format&fit=crop",
        link: "/adobe-creative-cloud",
      }
    ],
    
    // Digital Marketing ads
    "Digital Marketing": [
      {
        id: "dm1",
        title: "Social Media Management Tools - Free Trial",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2074&auto=format&fit=crop",
        link: "/social-media-tools",
      },
      {
        id: "dm2",
        title: "SEO Analytics Dashboard - 30% Discount",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
        link: "/seo-analytics",
      }
    ],
    
    // Writing & Translation ads
    "Content Writing": [
      {
        id: "wt1",
        title: "AI Writing Assistant - Premium Features",
        image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2074&auto=format&fit=crop",
        link: "/ai-writing-assistant",
      },
      {
        id: "wt2",
        title: "Grammar & Plagiarism Checker - Professional Plan",
        image: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=2070&auto=format&fit=crop",
        link: "/grammar-checker",
      }
    ],
    
    // Video & Animation ads
    "Video Editing": [
      {
        id: "va1",
        title: "Motion Graphics Templates - New Collection",
        image: "https://images.unsplash.com/photo-1574717024453-354056afd6fc?q=80&w=2070&auto=format&fit=crop",
        link: "/motion-graphics",
      },
      {
        id: "va2",
        title: "Video Editing Software - Special Discount",
        image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=2070&auto=format&fit=crop",
        link: "/video-editing-software",
      }
    ],
    
    // Mobile Development ads
    "Mobile Development": [
      {
        id: "md1",
        title: "App Testing Services - 20% Off First Month",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1974&auto=format&fit=crop",
        link: "/app-testing",
      },
      {
        id: "md2",
        title: "Mobile UI Kit - Premium Components",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop",
        link: "/mobile-ui-kit",
      }
    ],
    
    // UI/UX Design ads
    "UI/UX Design": [
      {
        id: "ux1",
        title: "Usability Testing Platform - Free Trial",
        image: "https://images.unsplash.com/photo-1587440871875-191322ee64b0?q=80&w=2071&auto=format&fit=crop",
        link: "/usability-testing",
      },
      {
        id: "ux2",
        title: "Prototyping Tools Bundle - 40% Discount",
        image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=2070&auto=format&fit=crop",
        link: "/prototyping-tools",
      }
    ],
    
    // Data Science ads
    "Data Science": [
      {
        id: "ds1",
        title: "Data Visualization Course - Early Bird Pricing",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
        link: "/data-viz-course",
      },
      {
        id: "ds2",
        title: "Cloud Computing Credits - $300 Free",
        image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop",
        link: "/cloud-computing",
      }
    ],
    
    // Default ads for any other category
    "default": [
      {
        id: "def1",
        title: "Boost Your Freelance Career - Pro Skills Course",
        image: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?q=80&w=2047&auto=format&fit=crop",
        link: "/freelance-course",
      },
      {
        id: "def2",
        title: "Business Management Tools - Free for 14 Days",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop",
        link: "/business-tools",
      },
      {
        id: "def3",
        title: "Professional Portfolio Website - Templates",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
        link: "/portfolio-templates",
      }
    ]
  };
  
  /**
   * Gets a random advertisement for the specified category
   * @param {string} category - The content category
   * @returns {Object} A randomly selected advertisement
   */
  export const getRandomAdForCategory = (category) => {
    // First, try to match the exact category
    if (adsByCategory[category]) {
      const categoryAds = adsByCategory[category];
      const randomIndex = Math.floor(Math.random() * categoryAds.length);
      return categoryAds[randomIndex];
    }
    
    // If no exact match, look for partial matches
    const partialMatches = Object.keys(adsByCategory).filter(key => 
      key !== "default" && 
      (category.includes(key) || key.includes(category))
    );
    
    if (partialMatches.length > 0) {
      // Pick a random partial match category
      const matchedCategory = partialMatches[Math.floor(Math.random() * partialMatches.length)];
      const matchedAds = adsByCategory[matchedCategory];
      return matchedAds[Math.floor(Math.random() * matchedAds.length)];
    }
    
    // Default fallback if no matches found
    const defaultAds = adsByCategory["default"];
    return defaultAds[Math.floor(Math.random() * defaultAds.length)];
  };
  
  /**
   * Gets all advertisements for a specific category
   * @param {string} category - The content category
   * @returns {Array} All advertisements for the category
   */
  export const getAllAdsForCategory = (category) => {
    if (adsByCategory[category]) {
      return adsByCategory[category];
    }
    
    // Try partial matches
    const partialMatches = Object.keys(adsByCategory).filter(key => 
      key !== "default" && 
      (category.includes(key) || key.includes(category))
    );
    
    if (partialMatches.length > 0) {
      // Pick the first partial match category
      return adsByCategory[partialMatches[0]];
    }
    
    return adsByCategory["default"];
  };
  
  /**
   * Gets a different ad for the same category
   * Used when showing multiple ads from the same category
   * @param {string} category - The content category
   * @param {string} excludeId - ID of ad to exclude (to avoid duplicates)
   * @returns {Object} A different ad from the category
   */
  export const getDifferentAdForCategory = (category, excludeId) => {
    const ads = getAllAdsForCategory(category);
    
    // Filter out the excluded ad
    const availableAds = ads.filter(ad => ad.id !== excludeId);
    
    // If no other ads available, return a default ad
    if (availableAds.length === 0) {
      const defaultAds = adsByCategory["default"].filter(ad => ad.id !== excludeId);
      return defaultAds[Math.floor(Math.random() * defaultAds.length)];
    }
    
    // Return a random ad from the filtered list
    return availableAds[Math.floor(Math.random() * availableAds.length)];
  };
  
  export default {
    getRandomAdForCategory,
    getAllAdsForCategory,
    getDifferentAdForCategory
  };