import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import TabToggle from "./common/TabToggle";

/* ── Types ────────────────────────────────────────────────────────── */

interface NotificationsScreenProps {
  onNavigate: (screen: string, payload?: Record<string, unknown>) => void;
}

interface NotificationItem {
  id: number;
  title: string;
  time: string;
  category: string;
  isUnread: boolean;
}

/* ── Component ────────────────────────────────────────────────────── */

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("all");

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, title: "New comment on your output", time: "2m ago", category: "Today", isUnread: true },
    { id: 2, title: "New team member added", time: "15m ago", category: "Today", isUnread: true },
    { id: 3, title: "Task archived", time: "1h ago", category: "Today", isUnread: false },
    { id: 4, title: "Project deadline updated", time: "3h ago", category: "Today", isUnread: false },
    { id: 5, title: "New comment on your output", time: "1d ago", category: "Yesterday", isUnread: true },
    { id: 6, title: "New team member added", time: "1d ago", category: "Yesterday", isUnread: false },
    { id: 7, title: "Task archived", time: "1d ago", category: "Yesterday", isUnread: false },
    { id: 8, title: "Weekly report generated", time: "1d ago", category: "Yesterday", isUnread: true },
    { id: 9, title: "System update scheduled", time: "2d ago", category: "2 days ago", isUnread: true },
    { id: 10, title: "Invoice processed successfully", time: "2d ago", category: "2 days ago", isUnread: false },
    { id: 11, title: "Meeting notes uploaded", time: "2d ago", category: "2 days ago", isUnread: false },
    { id: 12, title: "Quarterly review document shared", time: "3d ago", category: "3 days ago", isUnread: false },
    { id: 13, title: "Security alert: New login", time: "3d ago", category: "3 days ago", isUnread: false },
    { id: 14, title: "Performance metrics available", time: "3d ago", category: "3 days ago", isUnread: false },
    { id: 15, title: "New comment on your output", time: "1w ago", category: "1 week ago", isUnread: true },
    { id: 16, title: "Policy document updated", time: "1w ago", category: "1 week ago", isUnread: false },
    { id: 17, title: "Task archived", time: "1w ago", category: "1 week ago", isUnread: false },
    { id: 18, title: "Onboarding completed", time: "1w ago", category: "1 week ago", isUnread: false },
  ]);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    );
  };

  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => n.isUnread)
      : notifications;

  const groupedNotifications = filteredNotifications.reduce(
    (acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = [];
      acc[curr.category].push(curr);
      return acc;
    },
    {} as Record<string, NotificationItem[]>
  );

  const notificationTabs = [
    { label: `All (${notifications.length})`, value: "all" },
    { label: `Unread (${notifications.filter((n) => n.isUnread).length})`, value: "unread" },
  ];

  return (
    <div
      className="w-full h-full flex flex-col bg-[var(--card,#ffffff)] pb-[max(env(safe-area-inset-bottom),2.125rem)]"
    >
      {/* ── Navigation Header (375x52) ── */}
      <div
        className="w-full min-h-[3.25rem] flex items-center px-[var(--spacing-16)] pt-[max(env(safe-area-inset-top),2.75rem)]"
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

      {/* Toggle Container: 201 Hug x 45 Hug */}
      <div className="w-full flex justify-center mt-2 mb-4">
        <TabToggle
          tabs={notificationTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* ── Grouped Notification List ── */}
      <div className="flex-1 overflow-y-auto pb-[var(--spacing-12)]">
        {Object.entries(groupedNotifications).length > 0 ? (
          Object.entries(groupedNotifications).map(([category, items]) => (
            <div key={category}>
              {/* Category Header */}
              <h2 className="text-sm text-[var(--grey-500)] pt-4 pb-2 px-[var(--spacing-16)] font-normal">
                {category}
              </h2>

              {/* Notification Items */}
              <div className="w-full flex flex-col">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => markAsRead(item.id)}
                    className="w-full flex justify-between items-center py-3 px-[var(--spacing-16)] border-b border-[var(--grey-200)] last:border-b-0 active:bg-[var(--grey-100)] transition-colors text-left touch-manipulation"
                  >
                    <span
                      className={`text-sm text-[var(--grey-1000)] truncate pr-4 ${
                        item.isUnread ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="text-xs text-[var(--grey-400)] shrink-0">
                      {item.time}
                    </span>
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
