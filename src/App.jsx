import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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
import DrySyrupsProducts from "./pages/DrySyrupsProducts";
import AyurvedicProducts from "./pages/AyurvedicProducts";
import Services from "./pages/Services";
import GlobalPresence from "./pages/GlobalPresence";
import Contact from "./pages/Contact";
import ErrorBoundary from "./components/ErrorBoundary";
import "./i18n";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div
          className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300"
          style={{ minWidth: "768px" }}
        >
          <Navbar />
          <main className="pt-36">
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
                path="/products/dry-syrups"
                element={<DrySyrupsProducts />}
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
              <Route path="/services" element={<Services />} />
              <Route path="/global-presence" element={<GlobalPresence />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
