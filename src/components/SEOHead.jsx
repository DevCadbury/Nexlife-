import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getSEOData } from "../config/seo";

const SEOHead = ({
  title,
  description,
  keywords,
  image = "https://www.nexlifeinternational.com/src/assets/images/nexlife-logo.png",
  url = "https://www.nexlifeinternational.com",
  type = "website",
}) => {
  const location = useLocation();

  // Get SEO data from configuration
  const seoData = getSEOData(location.pathname);

  // Use provided props or fallback to configuration
  const finalTitle = title || seoData.title;
  const finalDescription = description || seoData.description;
  const finalKeywords = keywords || seoData.keywords;

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Update or create meta tags
    const updateMetaTag = (name, content, property = false) => {
      const selector = property
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let metaTag = document.querySelector(selector);

      if (!metaTag) {
        metaTag = document.createElement("meta");
        if (property) {
          metaTag.setAttribute("property", name);
        } else {
          metaTag.setAttribute("name", name);
        }
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute("content", content);
    };

    // Update canonical URL
    const canonicalUrl = `${url}${location.pathname}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    // Update meta tags
    updateMetaTag("description", finalDescription);
    updateMetaTag("keywords", finalKeywords);
    updateMetaTag("title", finalTitle);

    // Open Graph tags
    updateMetaTag("og:title", finalTitle, true);
    updateMetaTag("og:description", finalDescription, true);
    updateMetaTag("og:image", image, true);
    updateMetaTag("og:url", canonicalUrl, true);
    updateMetaTag("og:type", type, true);

    // Twitter Card tags
    updateMetaTag("twitter:title", finalTitle, true);
    updateMetaTag("twitter:description", finalDescription, true);
    updateMetaTag("twitter:image", image, true);
    updateMetaTag("twitter:url", canonicalUrl, true);

    // Add structured data for specific pages
    const addStructuredData = () => {
      // Remove existing structured data
      const existingScript = document.querySelector(
        'script[type="application/ld+json"]'
      );
      if (existingScript) {
        existingScript.remove();
      }

      let structuredData = {};

      // Homepage structured data
      if (location.pathname === "/") {
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Nexlife International",
          url: url,
          logo: image,
          description: finalDescription,
          foundingDate: "2020",
          industry: "Pharmaceutical",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-96648-43790",
            contactType: "customer service",
            availableLanguage: "English",
          },
          address: {
            "@type": "PostalAddress",
            addressCountry: "IN",
            addressLocality: "India",
          },
          sameAs: [
            "https://www.facebook.com/profile.php?id=61574990395658",
            "https://x.com/Nexlife_",
            "https://www.linkedin.com/in/nexlife-international-02a04235a",
            "https://www.instagram.com/nexlife_international",
          ],
        };
      }
      // Product page structured data
      else if (
        location.pathname.includes("/products") ||
        location.pathname.includes("/analgesic") ||
        location.pathname.includes("/antibiotic") ||
        location.pathname.includes("/cardiovascular")
      ) {
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Product",
          name: finalTitle,
          description: finalDescription,
          brand: {
            "@type": "Brand",
            name: "Nexlife International",
          },
          category: "Pharmaceutical Products",
          manufacturer: {
            "@type": "Organization",
            name: "Nexlife International",
          },
        };
      }
      // Contact page structured data
      else if (location.pathname === "/contact") {
        structuredData = {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: finalTitle,
          description: finalDescription,
          mainEntity: {
            "@type": "Organization",
            name: "Nexlife International",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+91-96648-43790",
              contactType: "customer service",
              availableLanguage: "English",
            },
          },
        };
      }

      // Add structured data if it exists
      if (Object.keys(structuredData).length > 0) {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
      }
    };

    addStructuredData();
  }, [
    finalTitle,
    finalDescription,
    finalKeywords,
    image,
    url,
    type,
    location.pathname,
  ]);

  return null; // This component doesn't render anything
};

export default SEOHead;
