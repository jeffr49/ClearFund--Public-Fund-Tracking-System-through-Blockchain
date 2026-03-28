"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./ProfileMenu.module.css";

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    // Navigate to the root (localhost:3000)
    router.push("/");
  };

  return (
    <div className={styles.profileContainer} ref={dropdownRef}>
      <button 
        className={styles.profileBtn} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User Profile"
      >
        <div className={styles.avatar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <span className={styles.nameLabel}>Profile</span>
        <svg 
          className={`${styles.chevron} ${isOpen ? styles.chevronUp : ""}`}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6"></path>
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <p className={styles.userEmail}>user@gov.in</p>
          </div>
          <div className={styles.divider}></div>
          <button className={styles.dropdownItem} onClick={() => {}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            View Profile
          </button>
          <div className={styles.divider}></div>
          <button className={styles.dropdownItem} onClick={handleSignOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
