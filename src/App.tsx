import { useState, useEffect, useRef } from "react";
import { M3 } from "tauri-plugin-m3";
import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import SplashScreen from "./components/SplashScreen";
import SignInScreen from "./components/SignInScreen";
import VerifyEmailScreen from "./components/VerifyEmailScreen";
import ProjectSelectionScreen from "./components/ProjectSelectionScreen";
import SubscriptionScreen from "./components/SubscriptionScreen";
import TermsOfServiceScreen from "./components/TermsOfServiceScreen";
import PrivacyPolicyScreen from "./components/PrivacyPolicyScreen";
import HomeScreen from "./components/HomeScreen";
import AgentsScreen from "./components/AgentsScreen";
import AgentDetailsScreen from "./components/AgentDetailsScreen";
import OutputsScreen from "./components/OutputsScreen";
import OutputDetailScreen from "./components/OutputDetailScreen";
import ApprovalsScreen from "./components/ApprovalsScreen";
import TranscriptScreen from "./components/TranscriptScreen";
import ApprovalDetailsScreen from "./components/ApprovalDetailsScreen";
import NotificationsScreen from "./components/NotificationsScreen";
import {
  DEFAULT_PROJECT_ID,
  saveSelectedProject,
  loadSelectedProject,
  type ApiProject,
} from "./lib/api/project";
import { useSocketChat } from "./lib/chat/useSocketChat";
import { getUserProfile } from "./lib/api/auth";
import { listOrganizations } from "./lib/api/organization";
import { getSubscriptionStatus, hasActiveSubscription } from "./lib/api/subscription";
import "./App.css";
import "./theme.css";

const SPLASH_DURATION = 2500;
const SPLASH_FADE_DURATION = 800;

type Screen =
  | "signin"
  | "verify"
  | "terms"
  | "privacy"
  | "project-select"
  | "subscription"
  | "home"
  | "agents"
  | "agent-details"
  | "outputs"
  | "approvals"
  | "approval-details"
  | "transcript"
  | "output-details"
  | "notifications";

type DocumentScreen = "signin" | "verify" | "terms" | "privacy";

// Screens whose top edge is the dark purple header gradient (see .bg-header-gradient)
// need light (white) status bar icons for contrast; every other screen has a light/white
// top edge and needs dark icons. Splash renders over whatever "signin" resolves to below it.
const DARK_HEADER_SCREENS = new Set<Screen>(["signin", "verify"]);

const AppContent = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("signin");
  // Popstate (hardware back) fires on a listener subscribed once on mount, so it
  // needs a live read of "what screen are we on right now" without resubscribing
  // on every navigation — a ref, not the state value itself, gives it that.
  const currentScreenRef = useRef(currentScreen);
  currentScreenRef.current = currentScreen;
  const [previousScreen, setPreviousScreen] = useState<DocumentScreen>("signin");
  const [userEmail, setUserEmail] = useState("");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ApiProject | null>(null);

  // Every real selection (initial project-select gate, or the in-chat
  // project switcher) also persists — see the session-restore effect below,
  // which is the only place this gets read back.
  const handleSelectProject = (project: ApiProject) => {
    setSelectedProject(project);
    saveSelectedProject(project.organizationId, project);
  };

  const [screenData, setScreenData] = useState<any>(null);
  const [transcriptPayload, setTranscriptPayload] = useState<any>(null);

  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  // Owned here (not inside HomeScreen) so the conversation and its socket
  // connection survive switching to Agents/Outputs/etc. and back — HomeScreen
  // unmounts on every such navigation (see the screen-switch render below),
  // which would otherwise wipe out chat state along with it.
  const chat = useSocketChat({
    organizationId,
    projectId: selectedProject?.id ?? DEFAULT_PROJECT_ID,
    userId,
  });

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Keeps the native status/nav bar icon color in sync with whichever screen is
  // showing, since it's one Activity/WebView across every React-level navigation —
  // a one-time call (as HomeScreen used to do) goes stale the moment the user
  // navigates to a screen with a different background.
  //
  // setBarColor is async and can race the WebView's readiness right after a cold
  // start/navigation, or transiently fail — either way it resolves false/rejects
  // rather than throwing synchronously. Left as a fire-and-forget single call, a
  // missed attempt leaves icons stuck in the previous screen's color (invisible
  // against the new background, e.g. white icons on a light screen) until the next
  // navigation happens to retry it. Retrying a few times closes that gap.
  useEffect(() => {
    let cancelled = false;
    const desiredColor = DARK_HEADER_SCREENS.has(currentScreen) ? "light" : "dark";
    const applyBarColor = async (attempt: number) => {
      if (cancelled) return;
      try {
        const success = await M3.setBarColor(desiredColor);
        if (!success && attempt < 3 && !cancelled) {
          setTimeout(() => applyBarColor(attempt + 1), 150);
        }
      } catch (err) {
        console.error("M3.setBarColor failed", err);
        if (attempt < 3 && !cancelled) {
          setTimeout(() => applyBarColor(attempt + 1), 150);
        }
      }
    };
    applyBarColor(0);
    return () => {
      cancelled = true;
    };
  }, [currentScreen]);

  // CSS env(safe-area-inset-*) works reliably on iOS/desktop but is unreliable on
  // some Android WebViews (it can silently report 0 there). tauri-plugin-m3 reads
  // Android's real WindowInsets directly, so on Android we override the CSS
  // custom properties every component reads (--safe-top/bottom/left/right, defined
  // in App.css) with actual per-device values; on iOS/desktop/browser preview
  // M3.getInsets() resolves without usable numbers and the env()-based CSS default
  // stays in effect untouched. Re-runs on resize/orientation change since insets
  // shift between portrait and landscape.
  useEffect(() => {
    let cancelled = false;
    const applySafeAreaInsets = async () => {
      const insets = await M3.getInsets();
      if (cancelled || !insets) return;
      const root = document.documentElement.style;
      if (insets.adjustedInsetTop != null) root.setProperty("--safe-top", `${insets.adjustedInsetTop}px`);
      if (insets.adjustedInsetBottom != null) root.setProperty("--safe-bottom", `${insets.adjustedInsetBottom}px`);
      if (insets.adjustedInsetLeft != null) root.setProperty("--safe-left", `${insets.adjustedInsetLeft}px`);
      if (insets.adjustedInsetRight != null) root.setProperty("--safe-right", `${insets.adjustedInsetRight}px`);
    };
    applySafeAreaInsets();
    window.addEventListener("resize", applySafeAreaInsets);
    window.addEventListener("orientationchange", applySafeAreaInsets);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", applySafeAreaInsets);
      window.removeEventListener("orientationchange", applySafeAreaInsets);
    };
  }, []);

  useEffect(() => {
    const handleFocus = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') setIsKeyboardOpen(true);
    };
    const handleBlur = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') setIsKeyboardOpen(false);
    };
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  // Applies the side effects a screen change needs (previousScreen/payload state)
  // without touching browser history — shared by forward navigation (handleNavigate)
  // and by popstate (going back/forward), which must never push a *new* history
  // entry of its own.
  const applyScreenChange = (screen: Screen, fromScreen: Screen, payload?: any) => {
    if (
      fromScreen === "signin" ||
      fromScreen === "verify" ||
      fromScreen === "terms" ||
      fromScreen === "privacy"
    ) {
      setPreviousScreen(fromScreen);
    }
    if (screen === "transcript") {
      setTranscriptPayload(payload);
    }
    if (payload !== undefined) {
      setScreenData(payload);
    }
    setCurrentScreen(screen);
  };

  // Every real navigation pushes onto the WebView's own session history so the
  // hardware/gesture back button — wired to WebView.goBack() natively, see
  // MainActivity.kt's handleBackNavigation override — has a real stack to step back
  // through, one screen at a time, matching whatever path the user actually took.
  //
  // Accepts `string` (not the stricter `Screen` union) because several child screens
  // declare their own `onNavigate` prop as `(screen: string, ...) => void` — App.tsx
  // is the single place that actually owns and controls the Screen union, so the
  // cast below is safe: every real call site passes one of the literal Screen values.
  const handleNavigate = (screen: string, payload?: any) => {
    const nextScreen = screen as Screen;
    applyScreenChange(nextScreen, currentScreen, payload);
    window.history.pushState({ screen: nextScreen, payload }, "");
  };

  // Syncs React state to whatever the browser/WebView just navigated to — fired by
  // the hardware back button (via WebView.goBack()) as well as any forward re-visit
  // of a popped entry. Must not call pushState/replaceState itself; the history
  // position already moved before this fires.
  useEffect(() => {
    window.history.replaceState({ screen: currentScreen }, "");

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as { screen?: Screen; payload?: any } | null;
      if (!state?.screen) return;
      applyScreenChange(state.screen, currentScreenRef.current, state.payload);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Silently resumes an existing session on cold start instead of forcing
  // Sign In -> OTP again every time the app process is killed and relaunched.
  // The auth_token cookie itself already survives that (the native HTTP
  // client keeps its own persistent cookie jar regardless of in-memory React
  // state — see lib/api/client.ts) — this just uses it via a cookie-only
  // profile check instead of throwing the session away unconditionally.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user } = await getUserProfile();
        if (cancelled) return;
        setUserId(user.id);
        setUserEmail(user.email);

        // Mirrors VerifyEmailScreen's org selection (org[2] ?? org[0]) until
        // the app supports switching organizations — see its own comment.
        const organizations = await listOrganizations();
        if (cancelled) return;
        const organization = organizations[2] ?? organizations[0];
        if (!organization) return;
        setOrganizationId(organization.id);

        const subscription = await getSubscriptionStatus(organization.id);
        if (cancelled) return;
        if (!hasActiveSubscription(subscription)) {
          handleNavigate("subscription");
          return;
        }

        const lastProject = loadSelectedProject(organization.id);
        if (lastProject) {
          setSelectedProject(lastProject);
          handleNavigate("home");
        } else {
          handleNavigate("project-select");
        }
      } catch {
        // No cookie, or it's no longer valid — stay on the sign-in screen.
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashFading(true);
      setTimeout(() => {
        setSplashVisible(false);
      }, SPLASH_FADE_DURATION);
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden" }}>
      <div id="safe-area-top" />
      <div id="safe-area-bottom" />
      {currentScreen === "signin" && (
        <SignInScreen
          onNavigateToVerify={() => handleNavigate("verify")}
          onNavigateToTerms={() => handleNavigate("terms")}
          onNavigateToPrivacy={() => handleNavigate("privacy")}
          setUserEmail={setUserEmail}
        />
      )}
      {currentScreen === "verify" && (
        <VerifyEmailScreen
          onNavigate={handleNavigate}
          userEmail={userEmail}
          setOrganizationId={setOrganizationId}
          setUserId={setUserId}
        />
      )}
      {currentScreen === "terms" && (
        <TermsOfServiceScreen onNavigate={handleNavigate} returnTo={previousScreen} />
      )}
      {currentScreen === "privacy" && (
        <PrivacyPolicyScreen onNavigate={handleNavigate} returnTo={previousScreen} />
      )}
      {currentScreen === "project-select" && (
        <ProjectSelectionScreen
          onNavigate={handleNavigate}
          organizationId={organizationId}
          onSelectProject={handleSelectProject}
        />
      )}
      {currentScreen === "subscription" && (
        <SubscriptionScreen onNavigate={handleNavigate} organizationId={organizationId} />
      )}
      {currentScreen === "home" && (
        <HomeScreen
          onNavigate={handleNavigate}
          isKeyboardOpen={isKeyboardOpen}
          userEmail={userEmail}
          organizationId={organizationId}
          userId={userId}
          selectedProject={selectedProject}
          onSelectProject={handleSelectProject}
          messages={chat.messages}
          isConnected={chat.isConnected}
          isSending={chat.isSending}
          connectionError={chat.connectionError}
          sendMessage={chat.sendMessage}
          answerQuestion={chat.answerQuestion}
          resolveAction={chat.resolveAction}
          startNewChat={chat.startNewChat}
          loadMessages={chat.loadMessages}
        />
      )}
      {currentScreen === "agents" && (
        <AgentsScreen
          onNavigate={handleNavigate}
          isKeyboardOpen={isKeyboardOpen}
          projectId={selectedProject?.id ?? DEFAULT_PROJECT_ID}
        />
      )}
      {currentScreen === "agent-details" && (
        <AgentDetailsScreen onNavigate={handleNavigate} {...screenData} />
      )}
      {currentScreen === "outputs" && (
        <OutputsScreen
          onNavigate={handleNavigate}
          setSelectedOutput={(o) => handleNavigate("output-details", o)}
          isKeyboardOpen={isKeyboardOpen}
          projectId={selectedProject?.id ?? DEFAULT_PROJECT_ID}
        />
      )}
      {currentScreen === "output-details" && (
        <OutputDetailScreen
          onNavigate={handleNavigate}
          output={screenData}
          projectId={selectedProject?.id ?? DEFAULT_PROJECT_ID}
        />
      )}
      {currentScreen === "approvals" && (
        <ApprovalsScreen onNavigate={handleNavigate} isKeyboardOpen={isKeyboardOpen} />
      )}
      {currentScreen === "approval-details" && (
        <ApprovalDetailsScreen
          onNavigate={handleNavigate}
          approvalData={screenData}
        />
      )}
      {currentScreen === "transcript" && (
        <TranscriptScreen onNavigate={handleNavigate} {...transcriptPayload} />
      )}
      {currentScreen === "notifications" && (
        <NotificationsScreen onNavigate={handleNavigate} />
      )}

      {splashVisible && <SplashScreen isFading={splashFading} />}
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;