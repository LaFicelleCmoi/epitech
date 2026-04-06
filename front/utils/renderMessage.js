const IMAGE_URL_REGEX = /^https?:\/\/\S+\.(gif|png|jpg|jpeg|webp)(\?\S*)?$/i;
const AUDIO_DATA_REGEX = /^data:audio\/(webm|ogg|mp3|wav|mpeg);base64,/i;
const MENTION_REGEX = /@(\S+)/g;

export function isImageUrl(text) {
  return IMAGE_URL_REGEX.test(text.trim());
}

export function isAudioData(text) {
  return AUDIO_DATA_REGEX.test(text.trim());
}

export function MessageContent({ text, currentUserName }) {
  if (isImageUrl(text)) {
    return (
      <img
        src={text.trim()}
        alt="image"
        className="message-image"
        loading="lazy"
      />
    );
  }

  if (isAudioData(text)) {
    return (
      <div className="message-audio">
        <span className="audio-icon">🎤</span>
        <audio controls preload="metadata" src={text.trim()} />
      </div>
    );
  }

  // Parse mentions in text
  const parts = [];
  let lastIndex = 0;
  let match;

  const regex = new RegExp(MENTION_REGEX.source, 'g');
  while ((match = regex.exec(text)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    const mentionName = match[1];
    const isMe = currentUserName && mentionName.toLowerCase() === currentUserName.toLowerCase();
    parts.push({ type: 'mention', value: match[0], name: mentionName, isMe });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  // If no mentions found, just return text
  if (parts.length === 0) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'mention') {
          return (
            <span
              key={i}
              className={`mention ${part.isMe ? 'mention-me' : ''}`}
              title={part.name}
            >
              {part.value}
            </span>
          );
        }
        return <span key={i}>{part.value}</span>;
      })}
    </>
  );
}
