import { Inter } from "next/font/google";
import "./pretty-dashboard.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export default function SidebarSegmentLayout({ children }) {
  return (
    <>
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      />
      <div className={`${inter.className} clearfund-sidebar-root`}>
        {children}
      </div>
    </>
  );
}
