'use client';

const EMOJI_LIST = [
  '👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉',
  '🔥', '👏', '💯', '✅', '❌', '⭐', '🚀', '💪',
  '🤔', '😎', '🥳', '💀', '👀', '🙏', '💜', '🫡'
];

export default function EmojiPicker({ onSelect, onClose }) {
  return (
    <div className="emoji-picker">
      {EMOJI_LIST.map((emoji) => (
        <button
          key={emoji}
          className="emoji-btn"
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
