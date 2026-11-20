import StyledComponentsRegistry from "./registry";
import Providers from "./providers";
// Font self-hosted (tanpa request ke Google Fonts saat runtime, tanpa layout shift).
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource-variable/source-serif-4/index.css";

export const metadata = {
  title: { default: "The Wild Oasis", template: "%s | The Wild Oasis" },
  description: "Internal booking & reservation management for The Wild Oasis.",
  // Aplikasi internal: jangan diindeks mesin pencari.
  robots: { index: false, follow: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Menyetel class tema sebelum paint supaya tidak ada kedipan terang/gelap.
const themeScript = `(function(){try{var s=localStorage.getItem('isDarkMode');var d=s!==null?JSON.parse(s):window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.add(d?'dark-mode':'light-mode');}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <StyledComponentsRegistry>
          <Providers>{children}</Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
