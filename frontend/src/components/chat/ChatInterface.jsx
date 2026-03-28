"use client";
import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatInterface.module.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, Sparkles, Trash2, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const ChatInterface = ({ onClose = null }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    setMessages(prev => [...prev, {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    }]);

    setLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await fetch(`${BACKEND_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory
        })
      });

      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`API route not found or server error (${response.status}). Check that /api/chat/message exists.`);
      }

      if (!response.ok) {
        if (response.status === 429 && data.error === 'API_BUSY') {
          throw new Error(data.message || 'The AI is currently cooling down due to high demand. Please try again in 1 minute.');
        }
        throw new Error(data.message || data.details || data.error || 'Failed to get response');
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: data.message,
        sender: 'assistant',
        timestamp: new Date()
      }]);
    } catch (err) {
      let friendlyError = err.message;
      if (err.message.includes('cooling down')) {
        // This is our friendly error thrown above
      } else if (err.message.includes('429')) {
        friendlyError = "The AI is currently cooling down due to many requests. Please wait a moment and try again.";
      } else if (err.message.includes('QuotaExceeded')) {
        friendlyError = "API quota exceeded. Please wait a minute before asking another question.";
      }

      setError(friendlyError);
      console.error('Chat error:', err);
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `Error: ${friendlyError}`,
        sender: 'system',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.headerContent}>
          <h2>ClearFund Assistant</h2>
          <p>Ask questions about public projects</p>
        </div>
        {onClose && (
          <button className={styles.closeBtn} onClick={onClose}>
            X
          </button>
        )}
      </div>

      <div className={styles.messagesContainer}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.aiIconWrapper}>
              <Sparkles size={40} className={styles.sparkleIcon} />
            </div>
            <h1>ClearFund Assistant</h1>
            <p className={styles.subtitle}>Your AI companion for blockchain-backed project tracking</p>
            
            <div className={styles.exampleGrid}>
              <p className={styles.examplesTitle}>Try asking:</p>
              <div className={styles.exampleTags}>
                <button onClick={() => setInput("What are the current projects?")}>Current Projects</button>
                <button onClick={() => setInput("Show me projects in bidding phase")}>Bidding Phase</button>
                <button onClick={() => setInput("List all project milestones")}>Milestones</button>
                <button onClick={() => setInput("What is the total budget allocated?")}>Total Budget</button>
              </div>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`${styles.message} ${styles[msg.sender]}`}
          >
            <div className={styles.avatarWrapper}>
              {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className={styles.messageBubble}>
              {msg.sender === 'assistant' || msg.sender === 'system' ? (
                <div className={styles.markdownContent}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p>{msg.text}</p>
              )}
              <small className={styles.timestamp}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </small>
            </div>
          </div>
        ))}

        {loading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.messageBubble}>
              <div className={styles.typing}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className={`${styles.message} ${styles.error}`}>
            <div className={styles.avatarWrapper}>
              <AlertCircle size={18} />
            </div>
            <div className={styles.messageBubble}>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <form onSubmit={sendMessage} className={styles.inputForm}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about ClearFund projects..."
            disabled={loading}
            className={styles.input}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={styles.sendBtn}
            title="Send Message"
          >
            {loading ? <div className={styles.miniLoader} /> : <Send size={20} />}
          </button>
        </form>
        
        {messages.length > 0 && (
          <button className={styles.clearBtn} onClick={clearChat}>
            <Trash2 size={14} className={styles.icon} />
            Clear Conversation
          </button>
        )}
      </div>

      <div className={styles.footer}>
        <small>Powered by ClearFund | AI responses based on database</small>
      </div>
    </div>
  );
};

export default ChatInterface;
