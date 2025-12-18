import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Heart,
  Share2,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Import gallery header image
import galleryHeaderImage from "../assets/images/gallery.png";

const Gallery = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeCounts, setLikeCounts] = useState({});
  const [userLikes, setUserLikes] = useState({});
  const [showDashboard, setShowDashboard] = useState(false);

  // API base URL - use environment variable or fallback to localhost
  const API_BASE = import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api`
    : "http://localhost:4000/api";

  // Fetch gallery images from API
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setLoading(true);
        console.log("Fetching gallery images from:", `${API_BASE}/gallery`);
        const response = await fetch(`${API_BASE}/gallery`);
        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response error:", errorText);
          throw new Error(
            `Failed to fetch gallery images: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Gallery data received:", data);
        setGalleryImages(data.items || []);

        // Initialize like counts from API data
        const initialLikeCounts = {};
        data.items?.forEach((image) => {
          initialLikeCounts[image._id] = image.likes || 0;
        });
        setLikeCounts(initialLikeCounts);
      } catch (err) {
        console.error("Error fetching gallery images:", err);
        setError(`Failed to load gallery images: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  // Load saved user likes from localStorage
  useEffect(() => {
    const savedUserLikes = localStorage.getItem("galleryUserLikes");
    if (savedUserLikes) {
      setUserLikes(JSON.parse(savedUserLikes));
    }
  }, []);

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    const newIndex =
      currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedImage(galleryImages[newIndex]);
  };

  const goToNext = () => {
    const newIndex =
      currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedImage(galleryImages[newIndex]);
  };

  const addLike = async (imageId) => {
    // Optimistic update
    setUserLikes((prev) => ({
      ...prev,
      [imageId]: (prev[imageId] || 0) + 1,
    }));
    setLikeCounts((prev) => ({
      ...prev,
      [imageId]: (prev[imageId] || 0) + 1,
    }));

    // Persist to localStorage immediately
    const updatedUserLikes = {
      ...userLikes,
      [imageId]: (userLikes[imageId] || 0) + 1,
    };
    localStorage.setItem("galleryUserLikes", JSON.stringify(updatedUserLikes));

    // Sync with server
    try {
      console.log(
        "Liking image:",
        imageId,
        "at",
        `${API_BASE}/gallery/${imageId}/like`
      );
      const response = await fetch(`${API_BASE}/gallery/${imageId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Like response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Like response data:", data);
        setLikeCounts((prev) => ({
          ...prev,
          [imageId]: data.likes,
        }));
      } else {
        const errorText = await response.text();
        console.error("Like error response:", errorText);
      }
    } catch (error) {
      console.error("Error liking image:", error);
    }
  };

  const shareImage = async (image) => {
    const shareData = {
      title: "Gallery image",
      text: "Check out this image from our gallery",
      url: `${window.location.origin}/gallery#image-${image._id}`,
    };

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(shareData.url);

        // Show a toast notification instead of alert
        const toast = document.createElement("div");
        toast.className =
          "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300";
        toast.textContent = "Gallery link copied to clipboard!";
        document.body.appendChild(toast);

        setTimeout(() => {
          toast.style.opacity = "0";
          toast.style.transform = "translateX(100%)";
          setTimeout(() => document.body.removeChild(toast), 300);
        }, 2000);
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert("Gallery link copied to clipboard!");
      } catch {
        alert("Unable to share. Please copy the URL manually.");
      }
    }
  };

  const openDashboard = () => {
    // Open dashboard in new tab to avoid disrupting user experience
    window.open(
      "https://nexlife-admin.vercel.app/login",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section with Gallery Image */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="relative w-full h-[40vh] sm:h-[45vh] md:h-[50vh] lg:h-[55vh] xl:h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
            <img
              src={galleryHeaderImage}
              alt="Global Pharmaceutical Network"
              className="w-full h-full object-cover object-[center_35%] scale-110 opacity-80"
            />
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Glassmorphism Card */}
              <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/20 rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 border border-white/20 dark:border-gray-700/30 shadow-2xl">
                <motion.h1
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6"
                >
                  Gallery
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-400 via-fuchsia-400 to-blue-400 mx-auto mb-4 sm:mb-6 rounded-full"
                />

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed font-medium"
                >
                  Explore our pharmaceutical facilities, products, and global
                  presence
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-400 mx-auto mb-4" />
                <p className="text-slate-400">Loading gallery images...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6"
            >
              {galleryImages.map((image, index) => (
                <motion.div
                  key={image._id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                  className="group relative overflow-hidden rounded-2xl bg-transparent shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => openLightbox(image, index)}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <div className="aspect-square overflow-hidden relative bg-transparent">
                    <img
                      src={image.url}
                      alt={image.alt || "Gallery image"}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />

                    {/* Action Buttons */}
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          addLike(image._id);
                        }}
                        className="p-1.5 sm:p-2 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 backdrop-blur-sm transition-all duration-300"
                      >
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          shareImage(image);
                        }}
                        className="p-1.5 sm:p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
                      >
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.button>
                    </div>

                    {/* Like Count */}
                    {likeCounts[image._id] > 0 && (
                      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-black/50 text-white text-xs sm:text-sm font-medium rounded-full backdrop-blur-sm">
                          <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-current text-red-400" />
                          <span>{likeCounts[image._id]}</span>
                          {userLikes[image._id] > 0 && (
                            <span className="text-red-300">
                              ({userLikes[image._id]})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !error && galleryImages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-400 mb-2">
                No images yet
              </h3>
              <p className="text-slate-500">
                Check back later for new gallery images
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={closeLightbox}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-4xl max-h-[95vh] sm:max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 p-1.5 sm:p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>

            {/* Image */}
            <img
              src={selectedImage.url}
              alt={selectedImage.alt || "Gallery image"}
              className="max-h-[85vh] max-w-full w-auto h-auto object-contain rounded-lg bg-black mx-auto"
            />

            {/* Image Actions */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 md:p-6 text-white">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="px-2 sm:px-3 py-1 bg-blue-600 text-xs sm:text-sm font-medium rounded-full">
                  Gallery
                </span>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addLike(selectedImage._id)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm bg-red-500 text-white hover:bg-red-600"
                >
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                  <span className="hidden sm:inline">Like</span>
                  {likeCounts[selectedImage._id] > 0 && (
                    <span className="ml-1 text-xs">
                      {likeCounts[selectedImage._id]}
                      {userLikes[selectedImage._id] > 0 && (
                        <span className="text-red-200">
                          {" "}
                          ({userLikes[selectedImage._id]})
                        </span>
                      )}
                    </span>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => shareImage(selectedImage)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-xs sm:text-sm"
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Share</span>
                </motion.button>
              </div>
            </div>

            {/* Image Counter */}
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 px-2 sm:px-3 py-1 bg-black/50 text-white text-xs sm:text-sm rounded-full">
              {currentIndex + 1} / {galleryImages.length}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Floating Dashboard Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        onClick={openDashboard}
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        title="Open Dashboard"
      >
        <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </motion.button>
    </div>
  );
};

export default Gallery;
