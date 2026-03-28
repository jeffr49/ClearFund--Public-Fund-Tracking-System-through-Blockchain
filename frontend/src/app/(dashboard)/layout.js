"use client";

import ProfileMenu from "../../components/ProfileMenu/ProfileMenu";
import styles from "./dashboard.css"; // Reuse dashboard styles if needed

export default function DashboardLayout({ children }) {
  return (
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Top Header/Navbar */}
      <header 
        style={{ 
          display: "grid",
          gridTemplateColumns: "200px 1fr 200px",
          alignItems: "center",
          padding: "12px 32px", 
          backgroundColor: "#fff", 
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 50
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
           <div style={{ 
             width: "36px", 
             height: "36px", 
             background: "linear-gradient(135deg, #2563eb, #3b82f6)", 
             borderRadius: "8px",
             display: "flex",
             alignItems: "center",
             justifyContent: "center",
             color: "white",
             fontWeight: "bold"
           }}>CF</div>
           <span style={{ fontWeight: 700, fontSize: "1.125rem", color: "#111827" }}>ClearFund</span>
        </div>

        {/* Centered Search Bar Placeholder */}
        <div style={{ justifySelf: "center", width: "100%", maxWidth: "500px", position: "relative" }}>
           <svg 
             style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }}
             width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
           >
             <circle cx="11" cy="11" r="8"></circle>
             <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
           </svg>
           <input 
             type="text" 
             placeholder="Search projects..." 
             style={{ 
               width: "100%", 
               padding: "10px 16px 10px 44px", 
               borderRadius: "9999px", 
               border: "1px solid #e5e7eb", 
               backgroundColor: "#f9fafb",
               outline: "none"
             }} 
           />
        </div>
        
        {/* The Profile & Signout Button */}
        <div style={{ justifySelf: "end" }}>
          <ProfileMenu />
        </div>
      </header>
      
      <main style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
}
