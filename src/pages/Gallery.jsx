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
} from "lucide-react";

// Import gallery images
import galleryHeaderImage from "../assets/images/gallery.png";
import gallery1 from "../assets/images/gallery/1.jpg";
import gallery2 from "../assets/images/gallery/2.jpg";
import gallery3 from "../assets/images/gallery/3.jpg";
import gallery4 from "../assets/images/gallery/4.jpg";
import gallery5 from "../assets/images/gallery/5.jpg";
import gallery6 from "../assets/images/gallery/6.jpg";
import gallery7 from "../assets/images/gallery/7.jpg";
import gallery8 from "../assets/images/gallery/8.jpg";
import gallery9 from "../assets/images/gallery/9.jpg";
import gallery10 from "../assets/images/gallery/10.jpg";
import gallery11 from "../assets/images/gallery/11.jpg";
import gallery12 from "../assets/images/gallery/12.jpg";
import gallery13 from "../assets/images/gallery/13.jpg";
import gallery14 from "../assets/images/gallery/14.jpg";
import gallery15 from "../assets/images/gallery/15.jpg";

const Gallery = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likeCounts, setLikeCounts] = useState({});
  const [userLikes, setUserLikes] = useState({});

  // Load saved likes from localStorage on component mount
  useEffect(() => {
    const savedUserLikes = localStorage.getItem("galleryUserLikes");
    const savedLikeCounts = localStorage.getItem("galleryLikeCounts");

    if (savedUserLikes) {
      setUserLikes(JSON.parse(savedUserLikes));
    }
    if (savedLikeCounts) {
      setLikeCounts(JSON.parse(savedLikeCounts));
    }
  }, []);

  // Gallery images from the gallery folder
  const galleryImages = [
    {
      id: 1,
      src: gallery1,
      title: "Pharmaceutical Manufacturing",
      description:
        "State-of-the-art manufacturing facility with advanced equipment",
    },
    {
      id: 2,
      src: gallery2,
      title: "Quality Control Laboratory",
      description: "Rigorous quality testing and analysis in our modern lab",
    },
    {
      id: 3,
      src: gallery3,
      title: "Research & Development",
      description: "Innovation and development of new pharmaceutical solutions",
    },
    {
      id: 4,
      src: gallery4,
      title: "Production Line",
      description:
        "Efficient production processes ensuring high-quality products",
    },
    {
      id: 5,
      src: gallery5,
      title: "Packaging Facility",
      description: "Advanced packaging technology for pharmaceutical products",
    },
    {
      id: 6,
      src: gallery6,
      title: "Laboratory Equipment",
      description: "Cutting-edge laboratory instruments for precise analysis",
    },
    {
      id: 7,
      src: gallery7,
      title: "Clean Room Environment",
      description: "Sterile environment maintaining highest quality standards",
    },
    {
      id: 8,
      src: gallery8,
      title: "Quality Assurance",
      description: "Comprehensive quality assurance processes and protocols",
    },
    {
      id: 9,
      src: gallery9,
      title: "Manufacturing Process",
      description: "Advanced manufacturing techniques and automation",
    },
    {
      id: 10,
      src: gallery10,
      title: "Product Development",
      description: "Innovative product development and formulation",
    },
    {
      id: 11,
      src: gallery11,
      title: "Testing Laboratory",
      description: "Comprehensive testing and validation procedures",
    },
    {
      id: 12,
      src: gallery12,
      title: "Production Facility",
      description: "Modern production facility with advanced technology",
    },
    {
      id: 13,
      src: gallery13,
      title: "Quality Control",
      description: "Stringent quality control measures and standards",
    },
    {
      id: 14,
      src: gallery14,
      title: "Manufacturing Excellence",
      description: "Excellence in pharmaceutical manufacturing processes",
    },
    {
      id: 15,
      src: gallery15,
      title: "Innovation Center",
      description: "Center of innovation for pharmaceutical research",
    },
  ];

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

  const addLike = (imageId) => {
    // Add a new like to the user's likes
    setUserLikes((prev) => ({
      ...prev,
      [imageId]: (prev[imageId] || 0) + 1,
    }));

    // Increase total like count
    setLikeCounts((prev) => ({
      ...prev,
      [imageId]: (prev[imageId] || 0) + 1,
    }));

    // Save to localStorage for persistence
    const updatedUserLikes = {
      ...userLikes,
      [imageId]: (userLikes[imageId] || 0) + 1,
    };
    const updatedLikeCounts = {
      ...likeCounts,
      [imageId]: (likeCounts[imageId] || 0) + 1,
    };

    localStorage.setItem("galleryUserLikes", JSON.stringify(updatedUserLikes));
    localStorage.setItem(
      "galleryLikeCounts",
      JSON.stringify(updatedLikeCounts)
    );
  };

  const shareImage = async (image) => {
    const shareData = {
      title: image.title,
      text: image.description,
      url: `${window.location.origin}/gallery#image-${image.id}`,
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
      console.error("Error sharing:", error);
      // Fallback: Copy URL to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert("Gallery link copied to clipboard!");
      } catch (clipboardError) {
        console.error("Clipboard error:", clipboardError);
        alert("Unable to share. Please copy the URL manually.");
      }
    }
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
              className="w-full h-full object-cover object-center object-[center_35%] scale-110 opacity-80"
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
          {/* Gallery Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6"
          >
            {galleryImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.3 },
                }}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-800 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-blue-500/30 dark:hover:border-blue-400/30"
                onClick={() => openLightbox(image, index)}
                style={{
                  cursor: "pointer",
                }}
              >
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Action Buttons */}
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        addLike(image.id);
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

                  {/* Zoom Icon */}
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="p-1.5 sm:p-2 rounded-full bg-white/20 text-white backdrop-blur-sm">
                      <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  </div>

                  {/* Like Count */}
                  {likeCounts[image.id] > 0 && (
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-black/50 text-white text-xs sm:text-sm font-medium rounded-full backdrop-blur-sm">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-current text-red-400" />
                        <span>{likeCounts[image.id]}</span>
                        {userLikes[image.id] > 0 && (
                          <span className="text-red-300">
                            ({userLikes[image.id]})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Border Animation */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-transparent group-hover:border-blue-500/50 transition-all duration-500" />
              </motion.div>
            ))}
          </motion.div>
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
              src={selectedImage.src}
              alt={selectedImage.title}
              className="w-full h-full object-contain rounded-lg"
            />

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 md:p-6 text-white">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">
                {selectedImage.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-200 mb-3 sm:mb-4">
                {selectedImage.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="px-2 sm:px-3 py-1 bg-blue-600 text-xs sm:text-sm font-medium rounded-full">
                  Gallery
                </span>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addLike(selectedImage.id)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm bg-red-500 text-white hover:bg-red-600"
                >
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                  <span className="hidden sm:inline">Like</span>
                  {likeCounts[selectedImage.id] > 0 && (
                    <span className="ml-1 text-xs">
                      {likeCounts[selectedImage.id]}
                      {userLikes[selectedImage.id] > 0 && (
                        <span className="text-red-200">
                          {" "}
                          ({userLikes[selectedImage.id]})
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
    </div>
  );
};

export default Gallery;
