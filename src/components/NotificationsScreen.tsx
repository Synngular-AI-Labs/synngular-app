import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────── */

interface NotificationsScreenProps {
  onNavigate: (screen: string, payload?: Record<string, unknown>) => void;
}

// Screen the notification's subject matter actually lives on, so tapping it
// can jump straight back to that origin instead of just marking it read.
type NotificationOrigin = "home" | "agents" | "outputs" | "approvals";

interface NotificationItem {
  id: number;
  title: string;
  subtitle: string;
  time: string;
  category: string;
  isUnread: boolean;
  origin: NotificationOrigin;
}

/* ── Component ────────────────────────────────────────────────────── */

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, title: "New comment on your output", subtitle: "Agents call", time: "2m ago", category: "Today", isUnread: true, origin: "outputs" },
    { id: 2, title: "New team member added and 5 people left the project.", subtitle: "Projects", time: "5h ago", category: "Today", isUnread: true, origin: "agents" },
    { id: 3, title: "Task archived", subtitle: "Task area", time: "7d ago", category: "Today", isUnread: false, origin: "outputs" },
    { id: 4, title: "Project deadline updated", subtitle: "Projects", time: "3h ago", category: "Today", isUnread: false, origin: "agents" },
    { id: 5, title: "New comment on your output", subtitle: "Agents call", time: "2m ago", category: "Yesterday", isUnread: false, origin: "outputs" },
    { id: 6, title: "New team member added", subtitle: "Members page", time: "5h ago", category: "Yesterday", isUnread: false, origin: "agents" },
    { id: 7, title: "Task archived", subtitle: "Task area", time: "7d ago", category: "Yesterday", isUnread: false, origin: "outputs" },
    { id: 8, title: "Weekly report generated", subtitle: "Reports", time: "1d ago", category: "Yesterday", isUnread: true, origin: "outputs" },
    { id: 9, title: "System update scheduled", subtitle: "System", time: "2d ago", category: "2 days ago", isUnread: true, origin: "home" },
    { id: 10, title: "Invoice processed successfully", subtitle: "Invoices", time: "2d ago", category: "2 days ago", isUnread: false, origin: "approvals" },
    { id: 11, title: "Meeting notes uploaded", subtitle: "Meetings", time: "2d ago", category: "2 days ago", isUnread: false, origin: "outputs" },
    { id: 12, title: "Quarterly review document shared", subtitle: "Documents", time: "3d ago", category: "3 days ago", isUnread: false, origin: "outputs" },
    { id: 13, title: "Security alert: New login", subtitle: "Security", time: "3d ago", category: "3 days ago", isUnread: false, origin: "home" },
    { id: 14, title: "Performance metrics available", subtitle: "Analytics", time: "3d ago", category: "3 days ago", isUnread: false, origin: "outputs" },
    { id: 15, title: "New comment on your output", subtitle: "Agents call", time: "1w ago", category: "1 week ago", isUnread: true, origin: "outputs" },
    { id: 16, title: "Policy document updated", subtitle: "Documents", time: "1w ago", category: "1 week ago", isUnread: false, origin: "outputs" },
    { id: 17, title: "Task archived", subtitle: "Task area", time: "1w ago", category: "1 week ago", isUnread: false, origin: "outputs" },
    { id: 18, title: "Onboarding completed", subtitle: "Onboarding", time: "1w ago", category: "1 week ago", isUnread: false, origin: "agents" },
  ]);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    );
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    onNavigate(item.origin);
  };

  const groupedNotifications = notifications.reduce(
    (acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = [];
      acc[curr.category].push(curr);
      return acc;
    },
    {} as Record<string, NotificationItem[]>
  );

  return (
    <div
      className="w-full h-full flex flex-col bg-[var(--card,#ffffff)] pb-[max(var(--safe-bottom),2.125rem)]"
    >
      {/* ── Navigation Header (375x52) ── */}
      <div
        className="w-full min-h-[3.25rem] flex items-center px-[var(--spacing-16)] pt-[max(var(--safe-top),2.75rem)]"
      >
        <div className="flex items-center gap-1">
          {/* Back icon button (36x36 container, 16x16 icon) */}
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="w-[2.25rem] h-[2.25rem] flex items-center justify-center shrink-0 rounded-xl text-[var(--foreground)] hover:bg-[var(--grey-100)] active:bg-[var(--grey-200)] cursor-pointer touch-manipulation"
            aria-label="Go back"
          >
            <ArrowLeft className="w-[1rem] h-[1rem]" />
          </button>

          {/* Title */}
          <h1 className="font-semibold text-[1.25rem] text-[var(--grey-1000)]">
            Notifications
          </h1>
        </div>
      </div>

      {/* ── Grouped Notification List ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-[var(--spacing-12)]">
        {Object.entries(groupedNotifications).length > 0 ? (
          Object.entries(groupedNotifications).map(([category, items]) => (
            <div key={category}>
              {/* Category Header */}
              <h2 className="text-xs text-[var(--grey-500)] pt-4 pb-2 font-normal">
                {category}
              </h2>

              {/* Notification Items */}
              <div className="w-full flex flex-col gap-1.5">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNotificationClick(item)}
                    className={`relative w-full flex items-start justify-between gap-3 text-left rounded-2xl px-3 py-2.5 transition-colors touch-manipulation ${
                      item.isUnread
                        ? "bg-[var(--grey-200)] active:bg-[var(--grey-300)]"
                        : "bg-transparent active:bg-[var(--grey-200)]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-5 font-normal text-[var(--grey-1000)]">
                        {item.title}
                      </p>
                      <p className="text-xs leading-[1.125rem] font-normal text-[var(--grey-500)] mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--grey-400)] shrink-0 whitespace-nowrap mt-0.5">
                      {item.time}
                    </span>

                    {item.isUnread && (
                      <span
                        aria-hidden="true"
                        className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[var(--purple-800)]"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-body-14-m text-[var(--grey-500)]">
              No notifications to show.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;
