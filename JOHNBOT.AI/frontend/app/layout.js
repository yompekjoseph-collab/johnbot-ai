import './globals.css';
import NavBar from './components/NavBar';

export const metadata = {
  title: 'Johnblex AI - Smart Chatbots',
  description: 'Build Smart AI Chatbots That Capture Leads & Book Demos Automatically',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main>{children}</main>
        <footer className="footer">
          © {new Date().getFullYear()} Johnblex AI. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
