'use client';

export default function MentionSuggestions({ suggestions, onSelect, activeIndex }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mention-suggestions">
      {suggestions.map((user, i) => (
        <div
          key={i}
          className={`mention-suggestion-item ${i === activeIndex ? 'active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent input blur
            onSelect(user);
          }}
        >
          <div className="mention-avatar">{(user).charAt(0).toUpperCase()}</div>
          <span>{user}</span>
        </div>
      ))}
    </div>
  );
}
