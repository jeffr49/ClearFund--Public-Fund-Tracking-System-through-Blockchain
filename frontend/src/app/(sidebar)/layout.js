import { Inter } from "next/font/google";
import "./dashboard.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export default function SidebarSegmentLayout({ children }) {
  return (
    <div className={`${inter.className} clearfund-sidebar-root`}>
      {children}
    </div>
  );
}
