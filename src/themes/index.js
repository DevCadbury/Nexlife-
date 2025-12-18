export const themes = {
  light: {
    name: "light",
    background: "bg-white",
    text: "text-gray-900",
    primary: "bg-primary-500",
    secondary: "bg-secondary-500",
    accent: "bg-blue-100",
    border: "border-gray-200",
    card: "bg-white shadow-lg",
    navbar: "bg-white/95 backdrop-blur-sm",
    topbar: "bg-gray-50",
  },
  dark: {
    name: "dark",
    background: "bg-gray-900",
    text: "text-white",
    primary: "bg-primary-600",
    secondary: "bg-secondary-600",
    accent: "bg-gray-800",
    border: "border-gray-700",
    card: "bg-gray-800 shadow-xl",
    navbar: "bg-gray-900/95 backdrop-blur-sm",
    topbar: "bg-gray-800",
  },
  brand: {
    name: "brand",
    background: "bg-gradient-to-br from-white to-blue-50",
    text: "text-gray-900",
    primary: "bg-gradient-to-r from-primary-500 to-primary-600",
    secondary: "bg-gradient-to-r from-secondary-500 to-secondary-600",
    accent: "bg-gradient-to-r from-blue-50 to-green-50",
    border: "border-blue-200",
    card: "bg-white/80 backdrop-blur-sm shadow-lg",
    navbar: "bg-white/90 backdrop-blur-sm",
    topbar: "bg-gradient-to-r from-primary-50 to-secondary-50",
  },
};

export const getTheme = (themeName) => {
  return themes[themeName] || themes.light;
};
