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
    }
  ]
};

/**
 * Gets a random advertisement for the specified category
 * @param {string} category - The content category
 * @returns {Object} A randomly selected advertisement
 */
export const getRandomAdForCategory = (category) => {
  // Find ads for the given category or use default if none available
  const categoryAds = adsByCategory[category] || adsByCategory["default"];
  
  // Return a random ad from the category
  const randomIndex = Math.floor(Math.random() * categoryAds.length);
  return categoryAds[randomIndex];
};

/**
 * Gets all advertisements for a specific category
 * @param {string} category - The content category
 * @returns {Array} All advertisements for the category
 */
export const getAllAdsForCategory = (category) => {
  return adsByCategory[category] || adsByCategory["default"];
};