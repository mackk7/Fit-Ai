import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../utils/api';

const SUGGESTIONS = [
  'Build me a 4-week strength program',
  'What should I eat post-workout?',
  'I feel sore — should I rest today?',
  'Help me lose fat without losing muscle',
  'How do I improve my squat form?',
  'Best supplements for muscle gain',
];

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AICoach() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hey Champ! I'm your personal AI fitness coach. I can design custom workout programs, give you precise nutrition advice, analyze your recovery, and keep you on track. Ask me anything — let's crush your goals together! 💪",
      time: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    setInput('');
    setShowSuggestions(false);
    setError(null);

    const userMsg = { id: Date.now(), role: 'user', content: msg, time: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Build API payload — only role + content
      const apiMessages = updatedMessages.map(({ role, content }) => ({ role, content }));
      const { reply } = await sendChatMessage(apiMessages);

      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: reply, time: new Date() }
      ]);
    } catch (err) {
      setError(err.message || 'Failed to connect to the AI coach. Is your backend running?');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="ai-avatar-large">🤖</div>
        <div className="chat-info">
          <h2>FitAI Coach</h2>
          <p>Powered by Groq LLaMA 3.3-70B · Expert fitness & nutrition coaching</p>
        </div>
      </div>
      {/* Messages */}
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className={`msg-avatar ${msg.role}`}>
              {msg.role === 'assistant' ? '🤖' : 'AK'}
            </div>
            <div>
              <div className="msg-bubble">{msg.content}</div>
              <div className="msg-time">{formatTime(msg.time)}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message ai">
            <div className="msg-avatar ai">🤖</div>
            <div className="typing-indicator">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '12px', color: '#ff6b6b', fontSize: '13px' }}>
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-section">
        {showSuggestions && (
          <div className="suggestions-row">
            {SUGGESTIONS.map(s => (
              <button key={s} className="suggestion-chip" onClick={() => handleSend(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="input-row">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI coach anything..."
            rows={1}
          />
          <button
            className="send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0a0a0a" strokeWidth="2">
              <line x1="4" y1="10" x2="16" y2="10" />
              <polyline points="11,5 16,10 11,15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
