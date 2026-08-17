import React, { useEffect, useRef, useState } from "react";
import logoAsset from "../assets/logo.png";
import { M3 } from "tauri-plugin-m3";
import {
  Menu,
  Bell,
  Paperclip,
  Send,
  Bot,
} from "lucide-react";
import FileOutputIcon from "./ui/FileOutputIcon";
import UserRoundCheckIcon from "./ui/UserRoundCheckIcon";
import MessageSquareTextIcon from "./ui/MessageSquareTextIcon";

interface HomeScreenProps {
  onNavigate: (screen: "splash" | "signin" | "verify" | "terms" | "privacy" | "home" | "agents" | "outputs" | "approvals") => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
 const [messages, setMessages] = useState
  < {
      id: string;
      text: string;
      isUser: boolean;
      files?: { url: string; type: string; name: string }[];
    }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      fileUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      fileUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const setStatusBarTheme = async () => {
      try {
        await M3.setBarColor("dark");
      } catch (error) {
        console.error("M3 status bar color error:", error);
      }
    };

    setStatusBarTheme();
  }, []);

  const handleSend = () => {
    if (!message.trim() && selectedFiles.length === 0) return;

    const fileData = selectedFiles.map((file) => {
      const url = URL.createObjectURL(file);
      fileUrlsRef.current.push(url);
      return {
        url,
        type: file.type,
        name: file.name,
      };
    });

    setMessages((current) => [
      ...current,
      {
        id: Date.now().toString(),
        text: message.trim(),
        isUser: true,
        files: fileData,
      },
    ]);
    setMessage("");
    setSelectedFiles([]);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "var(--background)",
        paddingTop: "max(env(safe-area-inset-top), 24px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
      }}
    >
      {/* ── Header ── */}
      <header className="relative z-30 w-full px-6 py-4 flex flex-row items-center justify-between flex-shrink-0 bg-[var(--background)]">
        <button
          type="button"
          aria-label="Open menu"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.("menu" as any);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--foreground)] hover:bg-[var(--grey-100)] active:bg-[var(--grey-200)] cursor-pointer touch-manipulation z-30"
        >
          <Menu className="w-6 h-6" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.("notifications" as any);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--foreground)] hover:bg-[var(--grey-100)] active:bg-[var(--grey-200)] cursor-pointer touch-manipulation z-30"
        >
          <Bell className="w-6 h-6" />
        </button>
      </header>

      {/* ── Body ── */}
      {messages.length === 0 ? (
        // ── Empty state ──
        <div className="flex flex-col flex-1 w-full">

          {/* Hero — grows to fill space and centers content */}
          <main className="flex-1 flex flex-col items-center justify-center w-full px-6">
            <img
              src={logoAsset}
              alt="Logo"
              className="w-[10vw] aspect-[71/70.01] max-w-[100px] min-w-[72px] object-contain mx-auto mb-4"
            />
            <h1 className="text-4xl font-semibold mb-2" style={{ color: "var(--foreground)" }}>
              Welcome back
            </h1>
            <p className="text-lg font-medium" style={{ color: "var(--muted-foreground)" }}>
              What do you want to achieve, today?
            </p>
          </main>

          {/* Input — mt-auto pushes it to the bottom */}
          <div className="w-full mt-auto">
            <InputArea
              message={message}
              setMessage={setMessage}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              fileInputRef={fileInputRef}
              handleSend={handleSend}
            />
          </div>
        </div>
      ) : (
        // ── Chat state ──
        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <div className="flex-1 overflow-y-auto w-full px-6 py-4 flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="self-end max-w-[85%] rounded-2xl px-4 py-3"
                style={{ background: "var(--purple-1000)" }}
              >
                {msg.files && msg.files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.files.map((file, index) =>
                      file.type.startsWith("image/") ? (
                        <img
                          key={`${file.name}-${index}`}
                          src={file.url}
                          alt={file.name}
                          className="w-16 h-16 rounded object-cover border"
                          style={{ borderColor: "var(--grey-100)" }}
                        />
                      ) : (
                        <div
                          key={`${file.name}-${index}`}
                          className="w-16 h-16 rounded bg-[var(--card)] flex flex-col items-center justify-center truncate p-1 text-[var(--foreground)]"
                        >
                          📄
                          <span className="mt-1 text-center truncate text-[0.5rem]">
                            {file.name}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}
                <span className="text-sm" style={{ color: "var(--background)" }}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          <InputArea
            message={message}
            setMessage={setMessage}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            fileInputRef={fileInputRef}
            handleSend={handleSend}
          />
        </div>
      )}

      {/* ── Bottom Nav ── */}
      <nav
        className="w-full flex flex-row items-center justify-between border-t border-[var(--grey-100)] bg-[var(--background)]"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
      >
        <div className="relative flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer">
          <div className="absolute top-0 inset-x-0 h-px bg-[var(--purple-1000)]" />
          <MessageSquareTextIcon size={24} style={{ color: "var(--purple-1000)" }} />
          <span className="text-xs font-medium text-[var(--purple-1000)]">Chat</span>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("agents")}
          className="flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer transition-colors"
        >
          <Bot size={24} strokeWidth={1.5} style={{ color: "var(--grey-700)" }} />
          <span className="text-xs font-medium text-[var(--grey-700)]">Agent</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("outputs")}
          className="flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer transition-colors"
        >
          <FileOutputIcon size={24} style={{ color: "var(--grey-700)" }} />
          <span className="text-xs font-medium text-[var(--grey-700)]">Outputs</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("approvals")}
          className="flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer transition-colors"
        >
          <UserRoundCheckIcon size={24} style={{ color: "var(--grey-700)" }} />
          <span className="text-xs font-medium text-[var(--grey-700)]">Approvals</span>
        </button>
      </nav>
    </div>
  );
};

// ── InputArea ──────────────────────────────────────────────────────────────
interface InputAreaProps {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleSend: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({
  message,
  setMessage,
  selectedFiles,
  setSelectedFiles,
  fileInputRef,
  handleSend,
}) => (
  <div className="w-full px-4 py-3 bg-[var(--background)] border-t border-[var(--grey-100)]">
    <input
      type="file"
      ref={fileInputRef}
      className="hidden"
      multiple
      onChange={(e) => {
        if (e.target.files) {
          const files = Array.from(e.target.files).slice(0, 10);
          setSelectedFiles(files);
        }
      }}
    />

    {selectedFiles.length > 0 && (
      <div className="flex flex-row gap-2 overflow-x-auto pb-2">
        {selectedFiles.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="relative w-10 h-10 rounded bg-[var(--grey-100)] flex items-center justify-center p-1"
          >
            <span className="text-[10px] text-[var(--foreground)] text-center truncate">
              {file.name}
            </span>
            <button
              type="button"
              className="absolute top-0 right-0 text-[8px]"
              style={{ color: "var(--foreground)" }}
              onClick={() =>
                setSelectedFiles((current) => current.filter((_, i) => i !== index))
              }
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-[10px] font-bold"
          style={{ color: "var(--foreground)" }}
          onClick={() => setSelectedFiles([])}
        >
          Clear
        </button>
      </div>
    )}

    <div className="w-full px-4 mb-4 flex-shrink-0">
      <div className="w-full min-h-24 border border-[var(--grey-300)] rounded-2xl bg-white flex flex-col justify-between p-3 shadow-sm">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full flex-1 bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder:text-[var(--grey-500)] resize-none"
        />

        <div className="flex flex-row items-center justify-end gap-2 w-full mt-2">
          <button
            type="button"
            aria-label="Attach file"
            className="p-1.5 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            onClick={() => fileInputRef?.current?.click()}
          >
            <Paperclip className="w-5 h-5 text-[var(--grey-700)]" />
          </button>

          <button
            type="button"
            aria-label="Send message"
            className="p-1.5 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            onClick={() => { if (message.trim().length > 0) handleSend(); }}
          >
            <Send
              className={`w-5 h-5 transition-colors duration-200 ${
                message.trim().length > 0 ? "text-[var(--purple-1000)]" : "text-[var(--grey-500)]"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default HomeScreen;