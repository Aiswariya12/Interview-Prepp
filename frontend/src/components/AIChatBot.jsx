import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAIAnswer } from '../services/aiService';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Move,
  RotateCcw,
  RefreshCw,
  Bot,
  User,
  Copy,
  Check,
  Minimize2,
  Maximize2,
  Lightbulb,
  Settings,
  Key,
  HelpCircle
} from 'lucide-react';

const QUICK_PROMPTS = [
  'Explain difference between HashMap and ConcurrentHashMap in Java',
  'How does React Virtual DOM and diffing work?',
  'What are ACID properties in MySQL transactions?',
  'Explain Spring Boot @Transactional propagation levels',
  '1+2',
  'Who is the president of India'
];

export const AIChatBot = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  // Hide chatbot during active live mock test session to prevent cheating
  const isMockSession = location.pathname.startsWith('/mock/session/');

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('interviewprep_gemini_key') || '');
  const [showRefreshToast, setShowRefreshToast] = useState(false);

  const getInitialGreeting = () => {
    const firstName = user?.name ? user.name.split(' ')[0] : 'there';
    return {
      id: 1,
      role: 'assistant',
      text: `Hello ${firstName}! 👋 I am your **InterviewPrep AI Assistant**.\n\nAsk me any question (coding, math, technical concepts, or general knowledge) and I will give you a clear, concise, and accurate answer!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const [messages, setMessages] = useState([getInitialGreeting()]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Position state (Draggable)
  const defaultPos = {
    x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 420) : 1000,
    y: typeof window !== 'undefined' ? Math.max(40, window.innerHeight - 620) : 200
  };

  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('interviewprep_chatbot_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return {
            x: Math.min(Math.max(10, parsed.x), window.innerWidth - 100),
            y: Math.min(Math.max(10, parsed.y), window.innerHeight - 100)
          };
        }
      }
    } catch (e) {
      // fallback
    }
    return defaultPos;
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Keep inside screen boundaries on resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(Math.max(10, prev.x), window.innerWidth - (isOpen ? (isExpanded ? 640 : 400) : 70)),
        y: Math.min(Math.max(10, prev.y), window.innerHeight - (isOpen ? (isExpanded ? 720 : 540) : 70))
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, isExpanded]);

  // Save position
  const savePosition = (newPos) => {
    setPosition(newPos);
    try {
      localStorage.setItem('interviewprep_chatbot_pos', JSON.stringify(newPos));
    } catch (e) {
      // ignore
    }
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest('button') || e.target.closest('input')) return;
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.preventDefault();
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragOffsetRef.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const targetWidth = isOpen ? (isExpanded ? 640 : 400) : 60;
      const targetHeight = isOpen ? (isExpanded ? 700 : 520) : 60;
      const newX = Math.min(Math.max(10, e.clientX - dragOffsetRef.current.x), window.innerWidth - targetWidth - 10);
      const newY = Math.min(Math.max(10, e.clientY - dragOffsetRef.current.y), window.innerHeight - targetHeight - 10);
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const targetWidth = isOpen ? (isExpanded ? 640 : 400) : 60;
      const targetHeight = isOpen ? (isExpanded ? 700 : 520) : 60;
      const newX = Math.min(Math.max(10, touch.clientX - dragOffsetRef.current.x), window.innerWidth - targetWidth - 10);
      const newY = Math.min(Math.max(10, touch.clientY - dragOffsetRef.current.y), window.innerHeight - targetHeight - 10);
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        savePosition(position);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isOpen, isExpanded, position]);

  const handleResetPosition = () => {
    const reset = {
      x: Math.max(20, window.innerWidth - (isExpanded ? 660 : 420)),
      y: Math.max(40, window.innerHeight - (isExpanded ? 720 : 560))
    };
    savePosition(reset);
  };

  // Refresh Chat functionality (New Chat)
  const handleRefreshChat = () => {
    const firstName = user?.name ? user.name.split(' ')[0] : 'there';
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        text: `Hello ${firstName}! 👋 Chat has been refreshed. What question or topic would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInputValue('');
    setShowRefreshToast(true);
    setTimeout(() => setShowRefreshToast(false), 2000);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Send message
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const answer = await getAIAnswer(query, user, geminiApiKey);
      const botMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: answer || "I'm here to help! Please ask any technical or general question.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Error getting AI answer:', err);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: `I ran into an issue while generating an answer. Please try asking again or rephrase your query!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveApiKey = (key) => {
    setGeminiApiKey(key);
    localStorage.setItem('interviewprep_gemini_key', key);
    setShowSettings(false);
  };

  // Simple Markdown renderer
  const renderFormattedText = (text) => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'code', lang: match[1], code: match[2] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return (
      <div className="space-y-2 text-[13px] leading-relaxed break-words">
        {parts.map((part, i) => {
          if (part.type === 'code') {
            return (
              <div key={i} className="my-2 rounded-lg bg-slate-900 text-slate-100 overflow-hidden text-xs">
                {part.lang && (
                  <div className="px-3 py-1 bg-slate-800 text-slate-400 font-mono text-[11px] flex justify-between items-center border-b border-slate-700">
                    <span>{part.lang}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(part.code)}
                      className="hover:text-white transition-colors"
                      title="Copy code"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <pre className="p-3 overflow-x-auto font-mono text-emerald-300">
                  <code>{part.code}</code>
                </pre>
              </div>
            );
          }

          return (
            <div key={i} className="space-y-1">
              {part.content.split('\n').map((line, lineIdx) => {
                if (!line.trim()) return <div key={lineIdx} className="h-1" />;

                const formattedLine = line
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/`(.*?)`/g, '<code class="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-mono text-xs border border-indigo-100">$1</code>');

                if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                  return (
                    <div key={lineIdx} className="flex items-start gap-1.5 pl-1">
                      <span className="text-indigo-500 font-bold mt-0.5">•</span>
                      <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-*]\s*/, '') }} />
                    </div>
                  );
                }

                if (line.trim().startsWith('### ') || line.trim().startsWith('#### ')) {
                  return (
                    <h4
                      key={lineIdx}
                      className="font-bold text-slate-900 mt-2 mb-1"
                      dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^#{3,4}\s*/, '') }}
                    />
                  );
                }

                return (
                  <p key={lineIdx} dangerouslySetInnerHTML={{ __html: formattedLine }} />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // DO NOT RENDER during active mock test session (Anti-cheat)
  if (isMockSession) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        touchAction: 'none'
      }}
      className="transition-shadow select-none"
    >
      {/* ── CLOSED STATE: Floating Draggable Bot Bubble ── */}
      {!isOpen && (
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="relative group cursor-grab active:cursor-grabbing"
          title="InterviewPrep AI Assistant (Click to open, drag to move)"
        >
          {/* Subtle online pulse */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>

          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white shadow-xl shadow-indigo-500/30 flex items-center justify-center hover:scale-105 transition-all duration-200 border-2 border-white/80"
          >
            <Bot className="w-7 h-7" />
          </button>

          {/* Tooltip on hover */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-slate-700/50 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Interview Coach</span>
            <span className="text-[10px] text-slate-400 font-normal">(Drag to reposition)</span>
          </div>
        </div>
      )}

      {/* ── OPEN STATE: Floating Draggable Chat Window ── */}
      {isOpen && (
        <div
          style={{
            width: isExpanded ? '640px' : '400px',
            height: isExpanded ? '720px' : '540px',
            maxWidth: 'calc(100vw - 20px)',
            maxHeight: 'calc(100vh - 20px)'
          }}
          className="bg-white rounded-3xl shadow-2xl border border-indigo-100/80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* ── Drag Header ── */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="px-4 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight">AI Assistant</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-400/25 text-emerald-200 border border-emerald-300/30">
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-indigo-200 font-medium">
                  {isAdmin ? 'Admin & Platform Assistant' : 'Instant & Concise Answers'}
                </p>
              </div>
            </div>

            {/* Window Action Controls */}
            <div className="flex items-center gap-1">
              {/* REFRESH CHAT BUTTON */}
              <button
                onClick={handleRefreshChat}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-all"
                title="Refresh Chat (Start new conversation)"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {/* SETTINGS (API Key) */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showSettings ? 'bg-white/25 text-white' : 'text-indigo-200 hover:text-white hover:bg-white/10'
                }`}
                title="AI Settings (Optional Gemini Key)"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              {/* RESET POSITION */}
              <button
                onClick={handleResetPosition}
                className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
                title="Reset position to bottom-right"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* EXPAND/COLLAPSE */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* MINIMIZE */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors ml-1"
                title="Minimize chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drag instruction notice & Refresh toast */}
          <div className="px-3 py-1 bg-indigo-50/80 border-b border-indigo-100 flex items-center justify-between text-[10px] text-indigo-700">
            <span className="flex items-center gap-1">
              <Move className="w-3 h-3 text-indigo-500" /> Drag top bar to reposition
            </span>
            {showRefreshToast ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3 h-3" /> Chat Refreshed!
              </span>
            ) : (
              <span className="text-slate-400">Ready</span>
            )}
          </div>

          {/* ── SETTINGS DRAWER (Optional Gemini Key) ── */}
          {showSettings && (
            <div className="p-3 bg-indigo-50 border-b border-indigo-100 text-xs space-y-2 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-indigo-600" /> Google Gemini API Key (Optional)
                </span>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                The chatbot works out of the box with zero setup! You can optionally paste your custom Google Gemini API key to override the default key.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Paste Gemini API Key (e.g. AQ... or AIzaSy...)"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleSaveApiKey(geminiApiKey)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* ── Messages Container ── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <>
                      {renderFormattedText(msg.text)}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Copy answer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Loading indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 border border-slate-200 shadow-xs flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-slate-500 font-medium ml-1">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick Prompts Carousel ── */}
          {messages.length <= 2 && (
            <div className="p-2.5 bg-white border-t border-slate-100 overflow-x-auto">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-500" /> Suggested Questions
                </p>
                <button
                  onClick={handleRefreshChat}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Refresh Chat
                </button>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-[11px] font-medium border border-indigo-200/60 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Input Box ── */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything (e.g. 1+2, what is java, who is the president of india)..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-center hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 transition-all shrink-0"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatBot;
