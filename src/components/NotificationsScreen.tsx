import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import TabToggle from "./common/TabToggle";

/* ── Layout Constants ─────────────────────────────────────────────── */
const SAFE_AREA_BOTTOM = "max(env(safe-area-inset-bottom), 1.5rem)";

/* ── Types ────────────────────────────────────────────────────────── */

interface NotificationsScreenProps {
  onNavigate: (screen: string, payload?: Record<string, unknown>) => void;
}

/* ── Dummy Data ───────────────────────────────────────────────────── */

interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  isUnread: boolean;
}

const notificationItems: NotificationItem[] = [
  {
    id: "1",
    title: "Agent completed task",
    subtitle: "Revenue services — Leads qualification finished successfully.",
    time: "2m ago",
    isUnread: true,
  },
  {
    id: "2",
    title: "Approval required",
    subtitle: "Grant access to confidential customer records.",
    time: "5m ago",
    isUnread: true,
  },
  {
    id: "3",
    title: "Output generated",
    subtitle: "New document ready for review.",
    time: "1h ago",
    isUnread: false,
  },
  {
    id: "4",
    title: "Agent failed task",
    subtitle: "Sales pipeline — API timeout during lead processing.",
    time: "2h ago",
    isUnread: false,
  },
  {
    id: "5",
    title: "New transcript available",
    subtitle: "Call recording from Marketing Agent is ready.",
    time: "3h ago",
    isUnread: false,
  },
  {
    id: "6",
    title: "System update",
    subtitle: "Synngular has been updated to the latest version.",
    time: "1d ago",
    isUnread: false,
  },
];

const notificationTabs = [
  { label: "All (6)", value: "all" },
  { label: "Unread (2)", value: "unread" },
];

/* ── Component ────────────────────────────────────────────────────── */

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("all");

  const filteredItems =
    activeTab === "unread"
      ? notificationItems.filter((item) => item.isUnread)
      : notificationItems;

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        background: "var(--card, #ffffff)",
        paddingBottom: SAFE_AREA_BOTTOM,
      }}
    >
      {/* ── Navigation Header (375x52) ── */}
      <div
        className="w-full h-[3.25rem] flex items-center px-[var(--spacing-16)]"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
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

      {/* ── Notification List ── */}
      <div className="flex-1 overflow-y-auto px-[var(--spacing-16)] pb-[var(--spacing-12)]">
        {filteredItems.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`flex flex-row items-start gap-3 py-3 ${
                  index < filteredItems.length - 1
                    ? "border-b"
                    : ""
                }`}
                style={{
                  borderColor: "var(--grey-100)",
                }}
              >
                {/* Dot indicator for unread */}
                <div className="mt-2 w-2 h-2 rounded-full flex-shrink-0" style={{
                  backgroundColor: item.isUnread ? "var(--purple-1000)" : "transparent",
                }} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-body-14-m ${item.isUnread ? "text-[var(--grey-1000)]" : "text-[var(--grey-700)]"}`}
                    style={{
                      fontWeight: item.isUnread ? 600 : 400,
                    }}
                  >
                    {item.title}
                  </p>
                  <p className="text-captions-12 text-[var(--grey-700)] mt-0.5 line-clamp-2">
                    {item.subtitle}
                  </p>
                  <span className="text-captions-12 text-[var(--grey-500)] mt-1 inline-block">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
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
