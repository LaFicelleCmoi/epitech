'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import GifPicker from './GifPicker';
import MentionSuggestions from './MentionSuggestions';
import AudioRecorder from './AudioRecorder';

export default function MessageInput({ currentChannel, sendMessage, setTyping, channelUsers = [], replyingTo, onCancelReply }) {
  const { t } = useI18n();
  const [message, setMessage] = useState('');
  const [showGif, setShowGif] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const inputRef = useRef(null);

  // Auto-focus input when replying
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  const getMentionSuggestions = () => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return channelUsers.filter(u => u.toLowerCase().includes(q)).slice(0, 6);
  };

  const suggestions = getMentionSuggestions();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage(message);
    setMessage('');
    setMentionQuery(null);
  };

  const handleChange = (value) => {
    setMessage(value);
    setTyping(true);

    const cursorPos = inputRef.current?.selectionStart || value.length;
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\S*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (userName) => {
    const cursorPos = inputRef.current?.selectionStart || message.length;
    const textBeforeCursor = message.slice(0, cursorPos);
    const textAfterCursor = message.slice(cursorPos);

    const newBefore = textBeforeCursor.replace(/@(\S*)$/, `@${userName} `);
    const newMessage = newBefore + textAfterCursor;

    setMessage(newMessage);
    setMentionQuery(null);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const pos = newBefore.length;
        inputRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && replyingTo) {
      onCancelReply && onCancelReply();
      return;
    }

    if (mentionQuery !== null && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        if (suggestions[mentionIndex]) {
          e.preventDefault();
          insertMention(suggestions[mentionIndex]);
        }
      } else if (e.key === 'Escape') {
        setMentionQuery(null);
      }
    }
  };

  const handleGifSelect = (gifUrl) => {
    sendMessage(gifUrl);
    setShowGif(false);
  };

  return (
    <div className="message-input-container">
      {showGif && (
        <GifPicker onSelect={handleGifSelect} onClose={() => setShowGif(false)} />
      )}

      <MentionSuggestions
        suggestions={suggestions}
        onSelect={insertMention}
        activeIndex={mentionIndex}
      />

      {replyingTo && (
        <div className="reply-bar">
          <div className="reply-bar-content">
            <span className="reply-bar-label">↩ </span>
            <span className="reply-bar-author">{replyingTo.sender}</span>
            <span className="reply-bar-text">{replyingTo.text?.slice(0, 80)}</span>
          </div>
          <button className="reply-bar-cancel" onClick={onCancelReply}>✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-row">
          <button
            type="button"
            className="gif-toggle-btn"
            onClick={() => setShowGif(!showGif)}
            title="GIF"
          >
            GIF
          </button>

          <input
            ref={inputRef}
            className="message-input"
            value={message}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={replyingTo ? `↩ ${replyingTo.sender}...` : `${t('chat.placeholder')}${currentChannel?.name || "..."}`}
            disabled={!currentChannel}
          />

          <AudioRecorder onSend={(audioData) => sendMessage(audioData)} />
        </div>
      </form>
    </div>
  );
}
