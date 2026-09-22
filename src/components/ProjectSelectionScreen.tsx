import React, { useState } from "react";
import logoAsset from "../assets/logo.png";
import { Menu, Bell } from "lucide-react";
// FIX 4 & 5: removed unused imports `Bot` from lucide-react and
// `UserRoundCheckIcon` â€” both were imported but never referenced in the
// component since those nav items are commented out.
import FileOutputIcon from "./ui/FileOutputIcon";
import MessageSquareTextIcon from "./ui/MessageSquareTextIcon";
import ProjectPickerSheet, { type Project } from "./ProjectPickerSheet";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Screen =
  | "signin" | "verify" | "terms" | "privacy"
  | "home" | "agents" | "outputs" | "approvals" | "notifications";

interface ProjectSelectionScreenProps {
  onNavigate: (screen: Screen) => void;
  organizationId: string | null;
  onSelectProject: (project: Project) => void;
}

// â”€â”€ ProjectSelectionScreen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// The gate screen shown right after sign-in, before any project is active.
const ProjectSelectionScreen: React.FC<ProjectSelectionScreenProps> = ({
  onNavigate,
  organizationId,
  onSelectProject,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const navItems = [
    {
      key: "home" as Screen,
      label: "Chat",
      icon: (active: boolean) => (
        <MessageSquareTextIcon
          size={24}
          style={{ color: active ? "var(--purple-1000)" : "var(--grey-500)" }}
        />
      ),
    },
    // {
    //   key: "agents" as Screen,
    //   label: "Agent",
    //   icon: (active: boolean) => (
    //     <Bot
    //       size={24} strokeWidth={1.5}
    //       style={{ color: active ? "var(--purple-1000)" : "var(--grey-500)" }}
    //     />
    //   ),
    // },
    {
      key: "outputs" as Screen,
      label: "Outputs",
      icon: (active: boolean) => (
        <FileOutputIcon
          size={24}
          style={{ color: active ? "var(--purple-1000)" : "var(--grey-500)" }}
        />
      ),
    },
    // {
    //   key: "approvals" as Screen,
    //   label: "Approvals",
    //   icon: (active: boolean) => (
    //     <UserRoundCheckIcon
    //       size={24}
    //       style={{ color: active ? "var(--purple-1000)" : "var(--grey-500)" }}
    //     />
    //   ),
    // },
  ] as const;

  return (
    <div
      className="flex flex-col bg-[var(--background)] overflow-hidden"
      style={{
        height:        "100dvh",
        paddingTop:    "max(var(--safe-top), 2.75rem)",
        paddingBottom: "max(var(--safe-bottom), 0.75rem)",
      }}
    >
      {/* â”€â”€ Header â”€â”€ */}
      <header
        className="w-full flex items-center justify-between flex-shrink-0 px-[var(--spacing-16)] pb-[var(--spacing-4)]"
      >
        {/* Inert until there's a project â€” Recents/history has nothing to show
            before one is picked. */}
        <button
          type="button"
          aria-label="Open menu"
          className="flex items-center justify-center flex-shrink-0 rounded-xl text-[var(--foreground)] touch-manipulation"
          style={{ width: "var(--btn-size-36)", height: "var(--btn-size-36)" }}
        >
          <Menu className="w-6 h-6" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          onClick={() => onNavigate("notifications")}
          className="flex items-center justify-center flex-shrink-0 rounded-xl text-[var(--foreground)] hover:bg-[var(--grey-100)] active:bg-[var(--grey-200)] touch-manipulation"
          style={{ width: "var(--btn-size-36)", height: "var(--btn-size-36)" }}
        >
          <Bell className="w-6 h-6" />
        </button>
      </header>

      {/* â”€â”€ Body â”€â”€ */}
      <main
        className="flex-1 flex flex-col items-center justify-center w-full min-h-0"
        style={{ padding: "0 clamp(1.25rem, 6vw, 2rem)" }}
      >
        <img
          src={logoAsset}
          alt="Logo"
          className="object-contain mx-auto mb-[var(--spacing-16)]"
          style={{
            width:       "clamp(4rem, 12vw, 6.25rem)",
            aspectRatio: "1 / 1",
          }}
        />

        <p
          className="font-medium text-center"
          style={{
            marginTop:  "var(--spacing-16)",
            maxWidth:   "min(90%, 20rem)",
            fontSize:   "clamp(0.8125rem, 3.6vw, 0.875rem)",
            lineHeight: 1.5,
            color:      "var(--grey-700)",
          }}
        >
          Choose a project to start chatting with its AI agents.
        </p>

        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="mt-[var(--spacing-16)] inline-flex w-fit max-w-full items-center justify-center rounded-lg border border-[var(--purple-1000)] bg-transparent px-[clamp(1rem,6vw,1.5rem)] py-[clamp(0.5rem,2.5vw,0.75rem)] font-semibold text-[var(--purple-1000)] transition-colors active:bg-[var(--purple-100)] touch-manipulation"
          style={{
            fontSize:   "clamp(0.75rem, 3.6vw, 0.875rem)",
            lineHeight: 1.5,
          }}
        >
          <span className="truncate">Select a Project</span>
        </button>
      </main>

      {/* â”€â”€ Bottom Nav â”€â”€ */}
      <nav
        className="w-full bg-white border-t border-[var(--grey-200)] flex flex-shrink-0"
        style={{
          padding:       "0.75rem 0.75rem 0",
          paddingBottom: "max(var(--safe-bottom), 0.75rem)",
          gap:           "0.75rem",
        }}
      >
        {navItems.map(({ key, label, icon }) => {
          const active = key === "home";
          const isDisabled = !active;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              disabled={isDisabled}
              aria-disabled={isDisabled}
              className={`flex-1 flex flex-col items-center justify-between relative touch-manipulation ${
                isDisabled ? "cursor-not-allowed opacity-50" : ""
              }`}
              style={{ height: "2.75rem" }}
            >
              {active && (
                <div
                  className="absolute left-0 w-full bg-[var(--purple-1000)] rounded-b-sm"
                  style={{ top: "-0.75rem", height: "0.125rem" }}
                />
              )}
              <div className="flex items-center justify-center" style={{ width: "1.5rem", height: "1.5rem" }}>
                {icon(active)}
              </div>
              <span
                className="font-medium"
                style={{
                  fontSize:   "0.625rem",
                  lineHeight: "0.75rem",
                  color:      active ? "var(--purple-1000)" : "var(--grey-500)",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      <ProjectPickerSheet
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        organizationId={organizationId}
        selectedProject={null}
        onSelectProject={(project) => {
          setIsPickerOpen(false);
          onSelectProject(project);
          onNavigate("home");
        }}
      />
    </div>
  );
};

export default ProjectSelectionScreen;