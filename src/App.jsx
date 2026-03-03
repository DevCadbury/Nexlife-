import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { useMobileViewport } from "./hooks/useMobileViewport";
import SEOHead from "./components/SEOHead";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Preloader from "./components/Preloader";
import PageLoader from "./components/PageLoader";
import ErrorBoundary from "./components/ErrorBoundary";
import "./i18n";

// ----- Lazy-loaded page chunks (only fetched when route is visited) -----
const Home                      = lazy(() => import("./pages/HomeNew"));
const About                     = lazy(() => import("./pages/About"));
const Products                  = lazy(() => import("./pages/Products"));
const AnalgesicProducts         = lazy(() => import("./pages/AnalgesicProducts"));
const AnthelminticProducts      = lazy(() => import("./pages/AnthelminticProducts"));
const AntiAllergicProducts      = lazy(() => import("./pages/AntiAllergicProducts"));
const AntiDiabeticProducts      = lazy(() => import("./pages/AntiDiabeticProducts"));
const AntiMalarialProducts      = lazy(() => import("./pages/AntiMalarialProducts"));
const AntiProtozoalProducts     = lazy(() => import("./pages/AntiProtozoalProducts"));
const CardiovascularProducts    = lazy(() => import("./pages/CardiovascularProducts"));
const AntiFungalProducts        = lazy(() => import("./pages/AntiFungalProducts"));
const AntiSpasmodicProducts     = lazy(() => import("./pages/AntiSpasmodicProducts"));
const AntibioticsGeneralProducts = lazy(() => import("./pages/AntibioticsGeneralProducts"));
const AntiConvulsantProducts    = lazy(() => import("./pages/AntiConvulsantProducts"));
const AntiEmeticProducts        = lazy(() => import("./pages/AntiEmeticProducts"));
const AntiUlcerativeProducts    = lazy(() => import("./pages/AntiUlcerativeProducts"));
const AntiViralProducts         = lazy(() => import("./pages/AntiViralProducts"));
const ErectileDysfunctionProducts = lazy(() => import("./pages/ErectileDysfunctionProducts"));
const LipidLoweringProducts     = lazy(() => import("./pages/LipidLoweringProducts"));
const PlateletAggregationProducts = lazy(() => import("./pages/PlateletAggregationProducts"));
const SteroidalDrugsProducts    = lazy(() => import("./pages/SteroidalDrugsProducts"));
const AyurvedicProducts         = lazy(() => import("./pages/ayurvedic"));
const AnalgesicCapsules         = lazy(() => import("./pages/capules/analgesic"));
const AntiDepressantCapsules    = lazy(() => import("./pages/capules/anti-depressant"));
const AntiEpilepticCapsules     = lazy(() => import("./pages/capules/anti-epileptic"));
const AntiFungalCapsules        = lazy(() => import("./pages/capules/anti-fungal"));
const AntiMalarialCapsules      = lazy(() => import("./pages/capules/anti-malarial"));
const AntiMigraineCapsules      = lazy(() => import("./pages/capules/anti-migraine"));
const AntiProtozoalCapsules     = lazy(() => import("./pages/capules/anti-protozoal"));
const AntiTubercularCapsules    = lazy(() => import("./pages/capules/anti-tubercular"));
const AntiUlcerativeCapsules    = lazy(() => import("./pages/capules/anti-ulcerative"));
const CardiovascularCapsules    = lazy(() => import("./pages/capules/cardiovascular"));
const GeneralAntibioticsCapsules = lazy(() => import("./pages/capules/general-antibiotics"));
const MultiVitaminsCapsules     = lazy(() => import("./pages/capules/multi-vitamins"));
const DrySyrups                 = lazy(() => import("./pages/dry-syrups"));
const AntiConvulsantCapsules    = lazy(() => import("./pages/capules/anti-convulsant"));
const SurgicalProducts          = lazy(() => import("./pages/surgical"));
const Services                  = lazy(() => import("./pages/Services"));
const Gallery                   = lazy(() => import("./pages/Gallery"));
const ProductGallery            = lazy(() => import("./pages/ProductGallery"));
const Certifications            = lazy(() => import("./pages/Certifications"));
const GlobalPresence            = lazy(() => import("./pages/GlobalPresence"));
const Contact                   = lazy(() => import("./pages/Contact"));
const Privacy                   = lazy(() => import("./pages/Privacy"));
const Terms                     = lazy(() => import("./pages/Terms"));
const HomeProductDetail         = lazy(() => import("./pages/HomeProductDetail"));
const NotFound                  = lazy(() => import("./pages/NotFound"));

function AppContent() {
  // Initialize mobile viewport optimization
  useMobileViewport();
  const { theme } = useTheme();
  const [isPreloading, setIsPreloading] = useState(true);

  useEffect(() => {
    if (isPreloading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isPreloading]);

  return (
    <Router>
      <SEOHead />
      <ScrollToTop />
      {isPreloading && <Preloader onComplete={() => setIsPreloading(false)} />}
      <div className={`min-h-screen transition-colors duration-300 w-full ${theme.background} ${theme.text}`}>
        <Navbar />
        <main className="pt-36 w-full">
          <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <Home />
                </ErrorBoundary>
              }
            />
            <Route path="/home-product/:id" element={<HomeProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route
              path="/products/analgesic"
              element={<AnalgesicProducts />}
            />
            <Route
              path="/products/anthelmintic"
              element={<AnthelminticProducts />}
            />
            <Route
              path="/products/anti-allergic"
              element={<AntiAllergicProducts />}
            />
            <Route
              path="/products/anti-diabetic"
              element={<AntiDiabeticProducts />}
            />
            <Route
              path="/products/ayurvedic"
              element={<AyurvedicProducts />}
            />
            <Route
              path="/products/anti-malarial"
              element={<AntiMalarialProducts />}
            />
            <Route
              path="/products/anti-protozoal"
              element={<AntiProtozoalProducts />}
            />
            <Route
              path="/products/cardiovascular"
              element={<CardiovascularProducts />}
            />
            <Route
              path="/products/anti-fungal"
              element={<AntiFungalProducts />}
            />
            <Route
              path="/products/anti-spasmodic"
              element={<AntiSpasmodicProducts />}
            />
            <Route
              path="/products/antibiotics-general"
              element={<AntibioticsGeneralProducts />}
            />
            <Route
              path="/products/anti-convulsant"
              element={<AntiConvulsantProducts />}
            />
            <Route
              path="/products/anti-emetic"
              element={<AntiEmeticProducts />}
            />
            <Route
              path="/products/anti-ulcerative"
              element={<AntiUlcerativeProducts />}
            />
            <Route
              path="/products/anti-viral"
              element={<AntiViralProducts />}
            />
            <Route
              path="/products/erectile-dysfunction"
              element={<ErectileDysfunctionProducts />}
            />
            <Route
              path="/products/lipid-lowering"
              element={<LipidLoweringProducts />}
            />
            <Route
              path="/products/platelet-aggregation"
              element={<PlateletAggregationProducts />}
            />
            <Route
              path="/products/steroidal-drugs"
              element={<SteroidalDrugsProducts />}
            />
            <Route
              path="/products/capsules/analgesic"
              element={<AnalgesicCapsules />}
            />
            <Route
              path="/products/capsules/anti-depressant"
              element={<AntiDepressantCapsules />}
            />
            <Route
              path="/products/capsules/anti-epileptic"
              element={<AntiEpilepticCapsules />}
            />
            <Route
              path="/products/capsules/anti-fungal"
              element={<AntiFungalCapsules />}
            />
            <Route
              path="/products/capsules/anti-malarial"
              element={<AntiMalarialCapsules />}
            />
            <Route
              path="/products/capsules/anti-migraine"
              element={<AntiMigraineCapsules />}
            />
            <Route
              path="/products/capsules/anti-protozoal"
              element={<AntiProtozoalCapsules />}
            />
            <Route
              path="/products/capsules/anti-tubercular"
              element={<AntiTubercularCapsules />}
            />
            <Route
              path="/products/capsules/anti-ulcerative"
              element={<AntiUlcerativeCapsules />}
            />
            <Route
              path="/products/capsules/cardiovascular"
              element={<CardiovascularCapsules />}
            />
            <Route
              path="/products/capsules/general-antibiotics"
              element={<GeneralAntibioticsCapsules />}
            />
            <Route
              path="/products/capsules/multi-vitamins"
              element={<MultiVitaminsCapsules />}
            />
            <Route path="/products/dry-syrups" element={<DrySyrups />} />
            <Route
              path="/products/capsules/anti-convulsant"
              element={<AntiConvulsantCapsules />}
            />
            <Route path="/products/surgical" element={<SurgicalProducts />} />

            <Route path="/services" element={<Services />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/product-gallery" element={<ProductGallery />} />
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/global-presence" element={<GlobalPresence />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            {/* 404 Route - Must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
