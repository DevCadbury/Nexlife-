import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // Navigation
      home: "Home",
      about: "About Us",
      products: "Products",
      services: "Services",
      globalPresence: "Global Presence",
      contact: "Contact",

      // Topbar
      phone: "+91 98765 43210",
      email: "info@nexlife.com",
      language: "Language",
      theme: "Theme",

      // Hero Section
      heroTitle: "Innovating Healthcare, Improving Lives",
      heroSubtitle:
        "Leading pharmaceutical import & export solutions worldwide",
      heroCTA: "Discover More",

      // About Section
      aboutTitle: "About Nexlife International",
      aboutSubtitle: "Your trusted partner in global pharmaceutical solutions",
      aboutDescription:
        "We are a leading pharmaceutical company specializing in import and export of high-quality medicines and healthcare products. With years of experience and a commitment to excellence, we serve healthcare providers worldwide.",
      mission: "Our Mission",
      missionText:
        "To provide accessible, high-quality pharmaceutical solutions that improve global health outcomes.",
      vision: "Our Vision",
      visionText:
        "To be the most trusted name in international pharmaceutical trade, connecting healthcare providers with quality products.",
      values: "Our Values",
      valuesText: "Quality, Integrity, Innovation, and Global Partnership.",

      // Products Section
      productsTitle: "Our Products",
      productsSubtitle: "Comprehensive range of pharmaceutical solutions",
      viewDetails: "View Details",

      // Services Section
      servicesTitle: "Our Services",
      servicesSubtitle: "End-to-end pharmaceutical trade solutions",
      importServices: "Import Services",
      exportServices: "Export Services",
      compliance: "Regulatory Compliance",
      logistics: "Logistics & Distribution",

      // Global Presence
      globalTitle: "Global Presence",
      globalSubtitle: "Serving healthcare providers worldwide",
      countries: "Countries Served",

      // Contact Section
      contactTitle: "Get In Touch",
      contactSubtitle: "We'd love to hear from you",
      name: "Full Name",
      subject: "Subject",
      message: "Message",
      sendMessage: "Send Message",
      contactInfo: "Contact Information",
      address: "Address",
      addressText: "Surat, Gujarat, India",

      // Footer
      quickLinks: "Quick Links",
      socialMedia: "Social Media",
      copyright: "© 2024 Nexlife International. All rights reserved.",

      // Theme
      light: "Light",
      dark: "Dark",
      brand: "Brand",

      // Common
      learnMore: "Learn More",
      readMore: "Read More",
      getStarted: "Get Started",
      explore: "Explore",
    },
  },
  hi: {
    translation: {
      // Navigation
      home: "होम",
      about: "हमारे बारे में",
      products: "उत्पाद",
      services: "सेवाएं",
      globalPresence: "वैश्विक उपस्थिति",
      contact: "संपर्क",

      // Topbar
      phone: "+91 98765 43210",
      email: "info@nexlife.com",
      language: "भाषा",
      theme: "थीम",

      // Hero Section
      heroTitle: "स्वास्थ्य सेवा में नवाचार, जीवन में सुधार",
      heroSubtitle:
        "दुनिया भर में फार्मास्युटिकल आयात और निर्यात समाधान में अग्रणी",
      heroCTA: "और जानें",

      // About Section
      aboutTitle: "नेक्सलाइफ इंटरनेशनल के बारे में",
      aboutSubtitle:
        "वैश्विक फार्मास्युटिकल समाधानों में आपका विश्वसनीय साझेदार",
      aboutDescription:
        "हम एक अग्रणी फार्मास्युटिकल कंपनी हैं जो उच्च गुणवत्ता वाली दवाओं और स्वास्थ्य देखभाल उत्पादों के आयात और निर्यात में विशेषज्ञता रखती है।",
      mission: "हमारा मिशन",
      missionText:
        "सुलभ, उच्च गुणवत्ता वाले फार्मास्युटिकल समाधान प्रदान करना जो वैश्विक स्वास्थ्य परिणामों में सुधार करें।",
      vision: "हमारा विजन",
      visionText:
        "अंतर्राष्ट्रीय फार्मास्युटिकल व्यापार में सबसे विश्वसनीय नाम बनना।",
      values: "हमारे मूल्य",
      valuesText: "गुणवत्ता, ईमानदारी, नवाचार और वैश्विक साझेदारी।",

      // Products Section
      productsTitle: "हमारे उत्पाद",
      productsSubtitle: "फार्मास्युटिकल समाधानों की व्यापक श्रृंखला",
      viewDetails: "विवरण देखें",

      // Services Section
      servicesTitle: "हमारी सेवाएं",
      servicesSubtitle: "एंड-टू-एंड फार्मास्युटिकल व्यापार समाधान",
      importServices: "आयात सेवाएं",
      exportServices: "निर्यात सेवाएं",
      compliance: "नियामक अनुपालन",
      logistics: "लॉजिस्टिक्स और वितरण",

      // Global Presence
      globalTitle: "वैश्विक उपस्थिति",
      globalSubtitle: "दुनिया भर में स्वास्थ्य देखभाल प्रदाताओं की सेवा",
      countries: "सेवा प्रदान किए गए देश",

      // Contact Section
      contactTitle: "संपर्क करें",
      contactSubtitle: "हम आपसे सुनना चाहेंगे",
      name: "पूरा नाम",
      subject: "विषय",
      message: "संदेश",
      sendMessage: "संदेश भेजें",
      contactInfo: "संपर्क जानकारी",
      address: "पता",
      addressText: "सूरत, गुजरात, भारत",

      // Footer
      quickLinks: "त्वरित लिंक",
      socialMedia: "सोशल मीडिया",
      copyright: "© 2024 नेक्सलाइफ इंटरनेशनल। सर्वाधिकार सुरक्षित।",

      // Theme
      light: "प्रकाश",
      dark: "अंधेरा",
      brand: "ब्रांड",

      // Common
      learnMore: "और जानें",
      readMore: "और पढ़ें",
      getStarted: "शुरू करें",
      explore: "अन्वेषण करें",
    },
  },
  fr: {
    translation: {
      // Navigation
      home: "Accueil",
      about: "À propos",
      products: "Produits",
      services: "Services",
      globalPresence: "Présence mondiale",
      contact: "Contact",

      // Topbar
      phone: "+91 98765 43210",
      email: "info@nexlife.com",
      language: "Langue",
      theme: "Thème",

      // Hero Section
      heroTitle: "Innover en santé, Améliorer la vie",
      heroSubtitle:
        "Solutions leader en import-export pharmaceutique dans le monde",
      heroCTA: "En savoir plus",

      // About Section
      aboutTitle: "À propos de Nexlife International",
      aboutSubtitle:
        "Votre partenaire de confiance en solutions pharmaceutiques mondiales",
      aboutDescription:
        "Nous sommes une entreprise pharmaceutique leader spécialisée dans l'import et l'export de médicaments et de produits de santé de haute qualité.",
      mission: "Notre Mission",
      missionText:
        "Fournir des solutions pharmaceutiques accessibles et de haute qualité qui améliorent les résultats de santé mondiaux.",
      vision: "Notre Vision",
      visionText:
        "Être le nom le plus fiable dans le commerce pharmaceutique international.",
      values: "Nos Valeurs",
      valuesText: "Qualité, Intégrité, Innovation et Partenariat mondial.",

      // Products Section
      productsTitle: "Nos Produits",
      productsSubtitle: "Gamme complète de solutions pharmaceutiques",
      viewDetails: "Voir les détails",

      // Services Section
      servicesTitle: "Nos Services",
      servicesSubtitle: "Solutions de commerce pharmaceutique de bout en bout",
      importServices: "Services d'importation",
      exportServices: "Services d'exportation",
      compliance: "Conformité réglementaire",
      logistics: "Logistique et distribution",

      // Global Presence
      globalTitle: "Présence mondiale",
      globalSubtitle: "Servir les fournisseurs de soins de santé dans le monde",
      countries: "Pays desservis",

      // Contact Section
      contactTitle: "Contactez-nous",
      contactSubtitle: "Nous aimerions avoir de vos nouvelles",
      name: "Nom complet",
      subject: "Sujet",
      message: "Message",
      sendMessage: "Envoyer le message",
      contactInfo: "Informations de contact",
      address: "Adresse",
      addressText: "Surat, Gujarat, Inde",

      // Footer
      quickLinks: "Liens rapides",
      socialMedia: "Réseaux sociaux",
      copyright: "© 2024 Nexlife International. Tous droits réservés.",

      // Theme
      light: "Clair",
      dark: "Sombre",
      brand: "Marque",

      // Common
      learnMore: "En savoir plus",
      readMore: "Lire la suite",
      getStarted: "Commencer",
      explore: "Explorer",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
