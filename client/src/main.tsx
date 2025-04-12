import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the document title
document.title = "Focus Flow - ADHD Task Assistant";

// Create a meta tag for theme color
const metaTheme = document.createElement('meta');
metaTheme.name = 'theme-color';
metaTheme.content = '#6C63FF';
document.head.appendChild(metaTheme);

// Add favicon link
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎯</text></svg>';
document.head.appendChild(favicon);

// Add font link
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
document.head.appendChild(fontLink);

createRoot(document.getElementById("root")!).render(<App />);
