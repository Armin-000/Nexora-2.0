import React, { useState, useRef, useEffect, useCallback } from "react";
import Prism from "prismjs";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

// Prism languages
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";

import SettingsModal from "./components/settingsModal";
import AdminPanel from "./components/AdminPanel";
import { useChat } from "./hooks/useChat";

/* ────────────────────────────────────────────────────────────
 * UI Types
 * ──────────────────────────────────────────────────────────── */

interface Segment {
  type: "text" | "code";
  content: string;
  lang?: string;
  key: string;
}

/* ────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────── */

const resolveLanguage = (raw?: string) => {
  const lang = (raw || "").toLowerCase();

  if (lang === "js" || lang === "javascript") return "javascript";
  if (lang === "ts" || lang === "typescript") return "typescript";
  if (lang === "tsx") return "tsx";
  if (lang === "jsx") return "jsx";
  if (lang === "html" || lang === "markup") return "markup";
  if (lang === "css") return "css";

  return "javascript";
};

const parseMessageContent = (content: string, messageId: number): Segment[] => {
  const segments: Segment[] = [];

  // Regex
  const codeRegex = /```([^\s`]+)?\s*\r?\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockIndex = 0;

  while ((match = codeRegex.exec(content)) !== null) {
    const [fullMatch, langRaw, codeRaw] = match;
    const matchStart = match.index;
    const matchEnd = matchStart + fullMatch.length;

    if (matchStart > lastIndex) {
      const textPart = content.slice(lastIndex, matchStart);
      const normalized = textPart.replace(/\n{3,}/g, "\n\n");
      if (normalized.trim().length > 0) {
        segments.push({
          type: "text",
          content: normalized,
          key: `${messageId}-text-${blockIndex}`,
        });
      }
    }

    const lang = (langRaw || "").trim() || "code";
    const code = (codeRaw || "").replace(/\s+$/, "");

    segments.push({
      type: "code",
      content: code,
      lang,
      key: `${messageId}-code-${blockIndex}`,
    });

    lastIndex = matchEnd;
    blockIndex += 1;
  }

  if (lastIndex < content.length) {
    const textPart = content.slice(lastIndex);
    const normalized = textPart.replace(/\n{3,}/g, "\n\n");
    if (normalized.trim().length > 0) {
      segments.push({
        type: "text",
        content: normalized,
        key: `${messageId}-text-end`,
      });
    }
  }

  if (segments.length === 0) {
    segments.push({
      type: "text",
      content,
      key: `${messageId}-text-only`,
    });
  }

  return segments;
};

/* ────────────────────────────────────────────────────────────
 * Subcomponents
 * ──────────────────────────────────────────────────────────── */

interface CodeBlockProps {
  segment: Segment;
  copiedBlockId: string | null;
  onCopy: (blockId: string, code: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  segment: seg,
  copiedBlockId,
  onCopy,
}) => {
  const lang = resolveLanguage(seg.lang);

  const highlighted = Prism.highlight(
    seg.content,
    Prism.languages[lang] || Prism.languages.javascript,
    lang
  );

  const isCopied = copiedBlockId === seg.key;

  return (
    <div className="code-block">
      <div className="code-header">
        <div className="code-title">
          <span className="code-dot red" />
          <span className="code-dot yellow" />
          <span className="code-dot green" />
          <span className="code-lang">{(seg.lang || "code").toUpperCase()}</span>
        </div>

        <button
          type="button"
          className={`code-copy-btn message-copy-btn ${isCopied ? "copied" : ""}`}
          onClick={() => onCopy(seg.key, seg.content)}
          aria-label="Kopiraj ovaj kod"
        >
          {isCopied ? (
            <span className="message-copy-check">✓</span>
          ) : (
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
      </div>

      <div className="code-body">
        <pre className={`language-${lang}`}>
          <code
            className={`language-${lang}`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────── */

const App: React.FC = () => {
  const { modelName, messages, isLoading, error, handleSend, handleStop } =
    useChat();

  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const { user: authUser, logout } = useAuth();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const visibleMessages = messages;
  const lastMessageId = visibleMessages[visibleMessages.length - 1]?.id;

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("nexora_theme", next);
      return next;
    });
  }, []);

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const handleLogout = () => {
    if (authUser) logout();
    navigate("/");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const stored = localStorage.getItem("nexora_theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  useEffect(() => {
    if (authUser) console.log("Decoded user token:", authUser);
  }, [authUser]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        handleSend(input);
        setInput("");
      }
    }
  };

  const handleCopyBlock = useCallback(async (blockId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedBlockId(blockId);
      setTimeout(() => setCopiedBlockId(null), 1500);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleCopyMessage = useCallback(
    async (messageId: number, content: string) => {
      try {
        await navigator.clipboard.writeText(content);
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 1500);
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  return (
    <div className={`app-root ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      <div className="chat-shell">
        <header className="topbar">
          <div className="topbar-main">
            <div className="topbar-title">NEXORA</div>
            <div className="topbar-subtitle">
              <span className="sub-label">Model</span>
              <span className="mono sub-model">{modelName}</span>
            </div>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Promijeni temu"
            />

            <button
              type="button"
              className="settings-btn"
              onClick={openSettings}
              aria-label="Otvori postavke"
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82-.33l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.57 0 1.11.24 1.51.67A2 2 0 1 1 19.4 15z"></path>
              </svg>
            </button>

            {authUser?.role === "admin" && (
              <button
                type="button"
                className="admin-btn"
                onClick={() => setIsAdminOpen(true)}
                aria-label="Admin panel"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="7" r="4"></circle>
                  <path d="M4 21c0-4 4-7 8-7s8 3 8 7"></path>
                </svg>
              </button>
            )}

            {authUser && (
              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
                aria-label="Odjava"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
              </button>
            )}
          </div>
        </header>

        <div className="chat-body">
          <main className="chat-main">
            <div className="messages">
              {visibleMessages.length === 0 && (
                <div className="empty-state">
                  <p>Spreman sam. Napiši pitanje ili zalijepi svoj kod.</p>
                  <ul>
                    <li>Napiši mi primjer HTML stranice za prodaju automobila.</li>
                    <li>Optimiziraj ovaj JavaScript kod.</li>
                    <li>Objasni mi ovaj TSX kod koji šaljem.</li>
                  </ul>
                </div>
              )}

              {visibleMessages.map((msg) => {
                const isUser = msg.role === "user";
                const isAssistant = msg.role === "assistant";
                const isLastAssistant = isAssistant && msg.id === lastMessageId;

                const segments: Segment[] = isAssistant
                  ? parseMessageContent(msg.content, msg.id)
                  : [
                      {
                        type: "text",
                        content: msg.content,
                        key: `${msg.id}-user-text`,
                      },
                    ];

                const showInlineTyping =
                  isLastAssistant && isLoading && msg.content.length === 0;

                return (
                  <div
                    key={msg.id}
                    className={`message-row ${isUser ? "user-row" : "assistant-row"}`}
                  >
                    <div className={`avatar ${isUser ? "avatar-user" : "avatar-bot"}`}>
                      {isUser ? "TY" : "</>"}
                    </div>

                    <div className={`bubble ${isUser ? "bubble-user" : "bubble-assistant"}`}>
                      <div className="bubble-header">
                        <span className="role-label">{isUser ? "Ti" : "Nexora"}</span>

                        {isAssistant && msg.content.length > 0 && (
                          <button
                            type="button"
                            className={`message-copy-btn ${
                              copiedMessageId === msg.id ? "copied" : ""
                            }`}
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            aria-label="Kopiraj cijeli odgovor"
                          >
                            {copiedMessageId === msg.id ? (
                              <span className="message-copy-check">✓</span>
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="bubble-content">
                        {showInlineTyping ? (
                          <div className="typing-inline">
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                          </div>
                        ) : (
                          segments.map((seg) =>
                            seg.type === "text" ? (
                              <div className="segment-text" key={seg.key}>
                                <ReactMarkdown
                                  components={{
                                    p: (props) => (
                                      <p style={{ whiteSpace: "pre-wrap" }} {...props} />
                                    ),
                                    li: (props) => (
                                      <li style={{ whiteSpace: "pre-wrap" }} {...props} />
                                    ),
                                  }}
                                >
                                  {seg.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <CodeBlock
                                key={seg.key}
                                segment={seg}
                                copiedBlockId={copiedBlockId}
                                onCopy={handleCopyBlock}
                              />
                            )
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>
          </main>

          <form
            className="input-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isLoading && input.trim()) {
                handleSend(input);
                setInput("");
              }
            }}
          >
            <div className="input-inner">
              <div className="input-main">
                <textarea
                  className="chat-input"
                  placeholder="Napiši pitanje ili zalijepi svoj kod ovdje..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                />

                <div className="input-hint">Enter = pošalji · Shift+Enter = novi red</div>
              </div>

              <button
                type="submit"
                className="send-btn"
                disabled={!input.trim() && !isLoading}
                onClick={(e) => {
                  if (isLoading) {
                    e.preventDefault();
                    handleStop();
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <span className="send-spinner" aria-hidden="true" />
                    <span className="send-label">Zaustavi</span>
                  </>
                ) : (
                  <>
                    <span className="send-label">Pošalji</span>
                    <span className="send-icon" aria-hidden="true">
                      ➤
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} user={authUser} />

        <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

        {error && <div className="error-banner">{error}</div>}
      </div>
    </div>
  );
};

export default App;
