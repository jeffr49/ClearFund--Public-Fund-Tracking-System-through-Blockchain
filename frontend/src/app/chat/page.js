"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ChatInterface from '@/components/chat/ChatInterface';
import styles from './chat.module.css';

export default function ChatPage() {
  return (
    <div className={styles.chatPageContainer}>
      <div className={styles.chatPageHeader}>
        <Link href="/dashboard" className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <h1>ClearFund AI Assistant</h1>
      </div>
      
      <div className={styles.chatPageContent}>
        <ChatInterface />
      </div>
    </div>
  );
}
