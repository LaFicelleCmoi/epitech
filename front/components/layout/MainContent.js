'use client';
import { useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import TopBar from './TopBar';
import ChatArea from '../chat/ChatArea';
import MessageInput from '../chat/MessageInput';

export default function MainContent({ currentChannel }) {
  const { t } = useI18n();
  const [sendMessageFn, setSendMessageFn] = useState(() => () => {});
  const [setTyping, setTypingFunction] = useState(() => () => {});
  const [channelUsers, setChannelUsers] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);

  if (!currentChannel) {
    return (
      <div className="main-content-empty">
        <h2 className="main-content-title">
          {t('server.welcome')}
        </h2>
        <p className="main-content-text">
          {t('chat.welcomeChannel')}
        </p>
      </div>
    );
  }

  const handleSendMessage = (msg) => {
    sendMessageFn(msg, replyingTo);
    setReplyingTo(null);
  };

  return (
    <div className="chat-container main-content-active">
      <TopBar currentChannel={currentChannel} />

      <ChatArea
        currentChannel={currentChannel}
        setSendMessage={setSendMessageFn}
        setTyping={setTypingFunction}
        setChannelUsers={setChannelUsers}
        onReply={setReplyingTo}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />

      <MessageInput
        currentChannel={currentChannel}
        sendMessage={handleSendMessage}
        setTyping={setTypingFunction}
        channelUsers={channelUsers}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
}
