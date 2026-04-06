'use client';

import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useI18n } from '../../i18n/I18nContext';
import EmojiPicker from '../chat/EmojiPicker';
import GifPicker from '../chat/GifPicker';
import AudioRecorder from '../chat/AudioRecorder';
import { sendNotification } from '../../utils/notifications';
import { MessageContent } from '../../utils/renderMessage';

let dmSocket = null;

export default function DMChat({ conversation }) {
  const { t } = useI18n();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingText, setTypingText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showEmojiFor, setShowEmojiFor] = useState(null);
  const [showGif, setShowGif] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.id);
    } catch (e) {}
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !conversation) return;

    dmSocket = io("http://localhost:3001", { auth: { token } });
    dmSocket.emit('join conversation', conversation._id);

    dmSocket.on('direct message', (data) => {
      if (data.conversationId === conversation._id) {
        setMessages(prev => [...prev, {
          _id: data._id,
          sender: data.sender,
          userId: data.userId,
          avatar: data.avatar || null,
          text: data.content,
          edited: false,
          reactions: [],
          replyTo: data.replyTo || null,
          createdAt: data.createdAt
        }]);
        if (document.hidden) sendNotification(`DM - ${data.sender}`, data.content);
      }
    });

    dmSocket.on('message edited', (data) => {
      if (data.conversationId === conversation._id) {
        setMessages(prev => prev.map(m =>
          m._id === data._id ? { ...m, text: data.content, edited: true } : m
        ));
      }
    });

    dmSocket.on('message reactions updated', (data) => {
      if (data.conversationId === conversation._id) {
        setMessages(prev => prev.map(m =>
          m._id === data._id ? { ...m, reactions: data.reactions } : m
        ));
      }
    });

    dmSocket.on('dm typing', (data) => {
      if (data.conversationId === conversation._id) {
        setTypingText(data.isTyping ? `${data.user} ${t('chat.typing')}` : '');
      }
    });

    return () => {
      if (dmSocket) {
        dmSocket.emit('leave conversation', conversation._id);
        dmSocket.disconnect();
      }
    };
  }, [conversation?._id]);

  useEffect(() => {
    if (!conversation) return;
    const fetchMessages = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:3001/conversations/${conversation._id}/messages`, {
          headers: { Authorization: "Bearer " + token }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMessages((data.data || []).map(m => ({
          _id: m._id,
          sender: m.sender,
          userId: m.userId,
          avatar: m.avatar || null,
          text: m.content,
          edited: m.edited || false,
          reactions: m.reactions || [],
          replyTo: m.replyTo || null,
          createdAt: m.createdAt
        })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
    setReplyingTo(null);
  }, [conversation?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (replyingTo && inputRef.current) inputRef.current.focus();
  }, [replyingTo]);

  const sendMsg = (msg) => {
    if (!msg.trim() || !dmSocket || !conversation) return;

    const payload = { conversationId: conversation._id, msg };
    if (replyingTo) {
      payload.replyTo = {
        messageId: replyingTo._id,
        sender: replyingTo.sender,
        content: replyingTo.text?.slice(0, 100) || ''
      };
    }

    dmSocket.emit('direct message', payload);
    dmSocket.emit('dm typing', { conversationId: conversation._id, isTyping: false });
    setReplyingTo(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMsg(input);
    setInput('');
  };

  const handleEdit = (msg) => {
    setEditingId(msg._id);
    setEditContent(msg.text);
    setReplyingTo(null);
  };

  const submitEdit = () => {
    if (!editContent.trim() || !dmSocket) return;
    dmSocket.emit('edit message', { messageId: editingId, content: editContent, conversationId: conversation._id });
    setEditingId(null);
    setEditContent('');
  };

  const handleReaction = (messageId, emoji) => {
    if (!dmSocket) return;
    const msg = messages.find(m => m._id === messageId);
    const reaction = msg?.reactions?.find(r => r.emoji === emoji);
    const hasReacted = reaction?.users?.includes(currentUserId);
    dmSocket.emit(hasReacted ? 'remove reaction' : 'add reaction', { messageId, emoji, conversationId: conversation._id });
    setShowEmojiFor(null);
  };

  const handleDeleteDM = async (msg) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3001/message/${msg._id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) throw new Error();
      setMessages(prev => prev.filter(m => m._id !== msg._id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!conversation) {
    return (
      <div className="dm-chat-empty">
        <p>{t('dm.noConversations')}</p>
      </div>
    );
  }

  const otherUserName = conversation.otherUser?.first_name || conversation.otherUser?.name || 'Utilisateur';

  return (
    <div className="dm-chat">
      <div className="dm-chat-header">
        <span>{otherUserName}</span>
      </div>

      <div className="dm-messages">
        {messages.map((m, i) => (
          <div key={m._id || i} className="message">
            <div className="message-avatar">
              {m.avatar ? (
                <img src={m.avatar} alt="" className="message-avatar-img" />
              ) : (
                (m.sender || '?').charAt(0).toUpperCase()
              )}
            </div>
            <div className="message-content">
              {m.replyTo && m.replyTo.messageId && (
                <div className="reply-preview">
                  <span className="reply-author">{m.replyTo.sender}</span>
                  <span className="reply-text">{m.replyTo.content}</span>
                </div>
              )}

              <span className="message-username">{m.sender}</span>

              {editingId === m._id ? (
                <div className="edit-form">
                  <input
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitEdit()}
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button onClick={submitEdit}>{t('chat.saveEdit')}</button>
                    <button onClick={() => setEditingId(null)}>{t('chat.cancelEdit')}</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="message-text">
                    <MessageContent text={m.text} currentUserName={null} />
                    {m.edited && <span className="edited-tag"> {t('chat.edited')}</span>}
                  </div>

                  {m.reactions && m.reactions.length > 0 && (
                    <div className="reactions-display">
                      {m.reactions.map((r, ri) => (
                        <button
                          key={ri}
                          className={`reaction-badge ${r.users?.includes(currentUserId) ? 'reacted' : ''}`}
                          onClick={() => handleReaction(m._id, r.emoji)}
                        >
                          {r.emoji} {r.users?.length || 0}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="message-actions">
                    <button className="msg-action-btn" onClick={() => setReplyingTo(m)}>
                      ↩
                    </button>
                    {m.userId === currentUserId && (
                      <button className="msg-action-btn" onClick={() => handleEdit(m)}>
                        {t('chat.editMessage')}
                      </button>
                    )}
                    {m.userId === currentUserId && (
                      <button className="msg-action-btn msg-delete-btn" onClick={() => handleDeleteDM(m)}>
                        {t('chat.deleteMessage')}
                      </button>
                    )}
                    <button
                      className="msg-action-btn"
                      onClick={() => setShowEmojiFor(showEmojiFor === m._id ? null : m._id)}
                    >
                      {t('reactions.addReaction')}
                    </button>
                  </div>

                  {showEmojiFor === m._id && (
                    <EmojiPicker
                      onSelect={(emoji) => handleReaction(m._id, emoji)}
                      onClose={() => setShowEmojiFor(null)}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typingText && <div className="typing">{typingText}</div>}

      <div className="message-input-container">
        {showGif && (
          <GifPicker
            onSelect={(url) => { sendMsg(url); setShowGif(false); }}
            onClose={() => setShowGif(false)}
          />
        )}

        {replyingTo && (
          <div className="reply-bar">
            <div className="reply-bar-content">
              <span className="reply-bar-label">↩ </span>
              <span className="reply-bar-author">{replyingTo.sender}</span>
              <span className="reply-bar-text">{replyingTo.text?.slice(0, 80)}</span>
            </div>
            <button className="reply-bar-cancel" onClick={() => setReplyingTo(null)}>✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <button type="button" className="gif-toggle-btn" onClick={() => setShowGif(!showGif)}>GIF</button>
            <input
              ref={inputRef}
              className="message-input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (dmSocket) dmSocket.emit('dm typing', { conversationId: conversation._id, isTyping: true });
              }}
              onKeyDown={(e) => { if (e.key === 'Escape' && replyingTo) setReplyingTo(null); }}
              placeholder={replyingTo ? `↩ ${replyingTo.sender}...` : t('dm.placeholder')}
            />

            <AudioRecorder onSend={(audioData) => sendMsg(audioData)} />
          </div>
        </form>
      </div>
    </div>
  );
}
