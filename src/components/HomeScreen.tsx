import React, { useEffect, useRef, useState } from "react";
import logoAsset from "../assets/logo.png";
import { M3 } from "tauri-plugin-m3";
import {
  Menu,
  Bell,
  Paperclip,
  SendHorizontal,
  MessageSquare,
  Bot,
  FileText,
  UserCheck,
} from "lucide-react";

interface HomeScreenProps {
  onNavigate: (screen: "splash" | "signin" | "verify" | "terms" | "privacy" | "home" | "agents" | "outputs" | "approvals") => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<
    {
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

      {messages.length === 0 ? (
        <>
          <main className="flex flex-col items-center px-6 pt-8">
            <img
              src={logoAsset}
              alt="Logo"
              className="w-[70px] h-[70.01px] object-contain mx-auto mb-4"
            />

            <h1 className="text-2xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>
              Welcome back
            </h1>
            <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
              What do you want to achieve, today?
            </p>
          </main>

          <div className="flex-grow" />
        </>
      ) : (
        <div className="flex-grow overflow-y-auto w-full px-6 py-4 flex flex-col gap-4">
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
                        className="w-16 h-16 rounded bg-[var(--card)] flex flex-col items-center justify-center text-[8px] truncate p-1 text-[var(--foreground)]"
                      >
                        📄
                        <span className="mt-1 text-[8px] text-center truncate">
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
      )}

      <div className="px-4 pb-6">
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
        <div
          className="rounded-xl p-4 shadow-md w-[342px] h-[102px] mx-auto flex flex-col justify-between overflow-hidden"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          {selectedFiles.length > 0 && (
            <div className="flex flex-row gap-2 overflow-x-auto pb-1">
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
                    onClick={() => {
                      setSelectedFiles((current) => current.filter((_, i) => i !== index));
                    }}
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

          <textarea
            className="w-full flex-1 min-h-0 resize-none bg-transparent border-none focus:outline-none text-sm placeholder:text-[var(--muted-foreground)]"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ color: "var(--foreground)" }}
          />

          <div className="flex justify-end items-end">
            <div className="flex items-center gap-3">
              <Paperclip
                size={18}
                className="cursor-pointer"
                style={{ color: "var(--purple-1000)" }}
                onClick={() => fileInputRef.current?.click()}
              />
              <SendHorizontal
                size={18}
                className="cursor-pointer"
                style={{ color: "var(--purple-1000)" }}
                onClick={handleSend}
              />
            </div>
          </div>
        </div>
      </div>

      <nav className="flex justify-around items-center py-3 border-t" style={{ borderTopColor: "var(--border)" }}>
        <div className="flex flex-col items-center pt-2" style={{ borderTopWidth: 3, borderTopStyle: 'solid', borderTopColor: 'var(--purple-1000)' }}>
          <MessageSquare size={20} style={{ color: "var(--purple-1000)" }} />
          <span className="text-xs mt-1" style={{ color: "var(--purple-1000)" }}>Chat</span>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("agents")}
          className="flex flex-col items-center pt-2 cursor-pointer"
          style={{ color: "var(--muted-foreground)" }}
        >
          <Bot size={20} style={{ color: "var(--muted-foreground)" }} />
          <span className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Agent</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("outputs")}
          className="flex flex-col items-center pt-2 cursor-pointer"
          style={{ color: "var(--muted-foreground)" }}
        >
          <FileText size={20} style={{ color: "var(--muted-foreground)" }} />
          <span className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Outputs</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("approvals")}
          className="flex flex-col items-center pt-2 cursor-pointer"
          style={{ color: "var(--muted-foreground)" }}
        >
          <UserCheck size={20} style={{ color: "var(--muted-foreground)" }} />
          <span className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Approvals</span>
        </button>
      </nav>
    </div>
  );
};

export default HomeScreen;
