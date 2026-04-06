'use client';

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useI18n } from "../../i18n/I18nContext";
import EmojiPicker from "./EmojiPicker";
import { sendNotification, requestNotificationPermission } from "../../utils/notifications";
import { MessageContent } from "../../utils/renderMessage";

let socket = null;

export default function ChatArea({ currentChannel, setSendMessage, setTyping, setChannelUsers, onReply }) {
  const { t } = useI18n();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingText, setTypingText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showEmojiFor, setShowEmojiFor] = useState(null);
  const messagesEndRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.id);
      setCurrentUserName(payload.name || payload.first_name || null);
    } catch (e) {}
  }, []);

  const fetchMessages = async (channelId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`http://localhost:3001/message/channel/${channelId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      setMessages((result.data || []).map(m => ({
        type: "chat",
        _id: m._id,
        sender: m.sender,
        userId: m.userId,
        text: m.content,
        edited: m.edited || false,
        reactions: m.reactions || [],
        replyTo: m.replyTo || null,
        createdAt: m.createdAt
      })));
    } catch (err) {
      console.error("Erreur récupération messages:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    socket = io("http://localhost:3001", { auth: { token } });

    socket.on("system", (msg) => {
      setMessages(prev => [...prev, { type: "system", text: msg }]);
    });

    requestNotificationPermission();

    socket.on("channel message", (data) => {
      setMessages(prev => [...prev, {
        type: "chat",
        _id: data._id,
        sender: data.sender,
        userId: data.userId,
        text: data.msg,
        edited: false,
        reactions: [],
        replyTo: data.replyTo || null,
        createdAt: data.createdAt
      }]);
      if (document.hidden) sendNotification(`${data.sender}`, data.msg);
    });

    socket.on("message edited", (data) => {
      setMessages(prev => prev.map(m =>
        m._id === data._id ? { ...m, text: data.content, edited: true } : m
      ));
    });

    socket.on("message reactions updated", (data) => {
      setMessages(prev => prev.map(m =>
        m._id === data._id ? { ...m, reactions: data.reactions } : m
      ));
    });

    socket.on("channel users", (data) => {
      if (String(data.channelId) === String(currentChannel?.id)) {
        setUsers(data.users);
        if (setChannelUsers) setChannelUsers(data.users);
      }
    });

    socket.on("typing", (data) => {
      setTypingText(data.isTyping ? `${data.user} ${t('chat.typing')}` : "");
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (!currentChannel) return;
    fetchMessages(currentChannel.id);
    if (!socket) return;
    setMessages([]);
    socket.emit("join channel", currentChannel.id);
    return () => { socket.emit("leave channel", currentChannel.id); };
  }, [currentChannel]);

  useEffect(() => {
    if (!socket) return;

    setSendMessage(() => (msg, replyData) => {
      if (!msg.trim() || !currentChannel) return;
      const payload = { channelId: currentChannel.id, msg };
      if (replyData) {
        payload.replyTo = {
          messageId: replyData._id,
          sender: replyData.sender,
          content: replyData.text?.slice(0, 100) || ''
        };
      }
      socket.emit("channel message", payload);
      socket.emit("typing", { channelId: currentChannel.id, isTyping: false });
    });

    setTyping((isTyping) => {
      if (!currentChannel) return;
      socket.emit("typing", { channelId: currentChannel.id, isTyping });
    });
  }, [currentChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEdit = (msg) => {
    setEditingId(msg._id);
    setEditContent(msg.text);
  };

  const submitEdit = () => {
    if (!editContent.trim() || !socket) return;
    socket.emit("edit message", { messageId: editingId, content: editContent, channelId: currentChannel?.id });
    setEditingId(null);
    setEditContent("");
  };

  const handleReaction = (messageId, emoji) => {
    if (!socket) return;
    const msg = messages.find(m => m._id === messageId);
    const reaction = msg?.reactions?.find(r => r.emoji === emoji);
    const hasReacted = reaction?.users?.includes(currentUserId);
    socket.emit(hasReacted ? 'remove reaction' : 'add reaction', { messageId, emoji, channelId: currentChannel?.id });
    setShowEmojiFor(null);
  };

  if (!currentChannel) {
    return (
      <div className="chat-area">
        <p className="no-channel">{t('chat.selectChannel')}</p>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="users">
        {t('chat.users')} : {users.join(", ") || "..."}
      </div>

      {typingText && <div className="typing">{typingText}</div>}

      <div className="messages">
        {messages.map((m, i) => (
          <div key={m._id || i} className={`message ${m.text && currentUserName && m.text.toLowerCase().includes(`@${currentUserName.toLowerCase()}`) ? 'message-mentioned' : ''}`}>
            {m.type === "system" ? (
              <div className="system">{m.text}</div>
            ) : (
              <>
                <div className="message-avatar"></div>
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
                        <MessageContent text={m.text} currentUserName={currentUserName} />
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
                        <button className="msg-action-btn" onClick={() => onReply && onReply(m)}>
                          ↩
                        </button>
                        {m.userId === currentUserId && (
                          <button className="msg-action-btn" onClick={() => handleEdit(m)}>
                            {t('chat.editMessage')}
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
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
