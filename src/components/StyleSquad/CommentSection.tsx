import React, { useState, useRef, useEffect } from 'react';
import type { SquadChatMessage } from '../../types';
import { useSquadStore } from '../../store/squadStore';
import { squadApi } from '../../services/squadApi';
import { handleApiError } from '../../utils/toast';
import styles from './CommentSection.module.css';

interface CommentSectionProps {
  outfitId: string;
  squadId: string;
  messages: SquadChatMessage[];
  onMessageUpdate: (messages: SquadChatMessage[]) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  outfitId,
  messages,
  onMessageUpdate,
}) => {
  const { currentUserId, currentUserName } = useSquadStore();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const messageText = newMessage.trim();
    if (!messageText) return;

    setIsSending(true);
    try {
      await squadApi.sendMessage({
        outfitId,
        userId: currentUserId,
        userName: currentUserName,
        message: messageText,
      });

      // Optimistically add the message
      const newMsg: SquadChatMessage = {
        userId: currentUserId,
        userName: currentUserName,
        message: messageText,
        sentAt: new Date().toISOString(),
      };

      onMessageUpdate([...messages, newMsg]);
      setNewMessage('');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Messages */}
      <div className={styles.messages}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>💬</span>
            <p className={styles.emptyText}>No comments yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isCurrentUser = msg.userId === currentUserId;
              return (
                <div
                  key={index}
                  className={`${styles.message} ${isCurrentUser ? styles.messageOwn : ''}`}
                >
                  <div className={styles.messageAvatar}>
                    {msg.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.messageContent}>
                    <div className={styles.messageHeader}>
                      <span className={styles.messageName}>{msg.userName}</span>
                      <span className={styles.messageTime}>{getTimeAgo(msg.sentAt)}</span>
                    </div>
                    <div className={styles.messageText}>{msg.message}</div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Add a comment..."
          maxLength={300}
          disabled={isSending}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={isSending || !newMessage.trim()}
          className={styles.sendButton}
        >
          {isSending ? (
            <div className={styles.spinner}></div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
