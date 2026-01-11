import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { useMobileViewport } from "./hooks/useMobileViewport";
import SEOHead from "./components/SEOHead";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import AnalgesicProducts from "./pages/AnalgesicProducts";
import AnthelminticProducts from "./pages/AnthelminticProducts";
import AntiAllergicProducts from "./pages/AntiAllergicProducts";
import AntiDiabeticProducts from "./pages/AntiDiabeticProducts";
import AntiMalarialProducts from "./pages/AntiMalarialProducts";
import AntiProtozoalProducts from "./pages/AntiProtozoalProducts";
import CardiovascularProducts from "./pages/CardiovascularProducts";
import AntiFungalProducts from "./pages/AntiFungalProducts";
import AntiSpasmodicProducts from "./pages/AntiSpasmodicProducts";
import AntibioticsGeneralProducts from "./pages/AntibioticsGeneralProducts";
import AntiConvulsantProducts from "./pages/AntiConvulsantProducts";
import AntiEmeticProducts from "./pages/AntiEmeticProducts";
import AntiUlcerativeProducts from "./pages/AntiUlcerativeProducts";
import AntiViralProducts from "./pages/AntiViralProducts";
import ErectileDysfunctionProducts from "./pages/ErectileDysfunctionProducts";
import LipidLoweringProducts from "./pages/LipidLoweringProducts";
import PlateletAggregationProducts from "./pages/PlateletAggregationProducts";
import SteroidalDrugsProducts from "./pages/SteroidalDrugsProducts";
import AyurvedicProducts from "./pages/ayurvedic";
import AnalgesicCapsules from "./pages/capules/analgesic";
import AntiDepressantCapsules from "./pages/capules/anti-depressant";
import AntiEpilepticCapsules from "./pages/capules/anti-epileptic";
import AntiFungalCapsules from "./pages/capules/anti-fungal";
import AntiMalarialCapsules from "./pages/capules/anti-malarial";
import AntiMigraineCapsules from "./pages/capules/anti-migraine";
import AntiProtozoalCapsules from "./pages/capules/anti-protozoal";
import AntiTubercularCapsules from "./pages/capules/anti-tubercular";
import AntiUlcerativeCapsules from "./pages/capules/anti-ulcerative";
import CardiovascularCapsules from "./pages/capules/cardiovascular";
import GeneralAntibioticsCapsules from "./pages/capules/general-antibiotics";
import MultiVitaminsCapsules from "./pages/capules/multi-vitamins";
import DrySyrups from "./pages/dry-syrups";
import AntiConvulsantCapsules from "./pages/capules/anti-convulsant";
import SurgicalProducts from "./pages/surgical";
import Services from "./pages/Services";
import Gallery from "./pages/Gallery";
import ProductGallery from "./pages/ProductGallery";
import Certifications from "./pages/Certifications";
import GlobalPresence from "./pages/GlobalPresence";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import "./i18n";

function AppContent() {
  // Initialize mobile viewport optimization
  useMobileViewport();
  const { theme } = useTheme();

  return (
    <Router>
      <SEOHead />
      <ScrollToTop />
      <div className={`min-h-screen transition-colors duration-300 w-full ${theme.background} ${theme.text}`}>
        <Navbar />
        <main className="pt-36 w-full">
          <Routes>
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <Home />
                </ErrorBoundary>
              }
            />
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
