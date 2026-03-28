"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import styles from './ChatButton.module.css';

const ChatButton = () => {
  return (
    <Link href="/chat" className={styles.chatButtonWrapper}>
      <button className={styles.chatButton} title="Open AI Assistant">
        <div className={styles.iconWrapper}>
          <Sparkles size={20} />
        </div>
        <span className={styles.label}>Chat with AI</span>
        <div className={styles.pulseRing}></div>
      </button>
    </Link>
  );
};

export default ChatButton;
