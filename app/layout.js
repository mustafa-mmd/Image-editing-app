// app/layout.js
import './globals.css';

export const metadata = {
  title: 'AI Photo Editor - Professional Image Editing',
  description: 'Edit your photos with AI-powered background removal, real-time adjustments, and format conversion.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}