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
import { getUserProfile } from "./lib/api/auth";
import { ApiError } from "./lib/api/client";
import {
  DEFAULT_PROJECT_ID,
  saveSelectedProject,
  loadSelectedProject,
  type ApiProject,
} from "./lib/api/project";
import { useSocketChat } from "./lib/chat/useSocketChat";
import {
  listOrganizations,
  findOrganizationWithActiveSubscription,
  type Organization,
} from "./lib/api/organization";
import {
  getSubscriptionStatus,
  hasActiveSubscription,
} from "./lib/api/subscription";
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

  const [, setIsRestoringSession] = useState(true);

  // Popstate (hardware back) fires on a listener subscribed once on mount, so it
  // needs a live read of "what screen are we on right now" without resubscribing
  // on every navigation â€” a ref, not the state value itself, gives it that.
  const currentScreenRef = useRef(currentScreen);
  currentScreenRef.current = currentScreen;

  const [previousScreen, setPreviousScreen] =
    useState<DocumentScreen>("signin");

  const [userEmail, setUserEmail] = useState("");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] =
    useState<ApiProject | null>(null);

  // Every real selection (initial project-select gate, or the in-chat
  // project switcher) also persists the selected project for this organization.
  const handleSelectProject = (project: ApiProject) => {
    setSelectedProject(project);
    saveSelectedProject(project.organizationId, project);
  };

  const handleSelectOrganization = async (
    organization: Organization
  ) => {
    const subscription = await getSubscriptionStatus(organization.id);

    setOrganizationId(organization.id);
    setSelectedProject(null);

    handleNavigate(
      hasActiveSubscription(subscription)
        ? "project-select"
        : "subscription"
    );
  };

  const [screenData, setScreenData] = useState<any>(null);
  const [transcriptPayload, setTranscriptPayload] = useState<any>(null);

  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  // Owned here (not inside HomeScreen) so the conversation and its socket
  // connection survive switching to Agents/Outputs/etc. and back â€” HomeScreen
  // unmounts on every such navigation (see the screen-switch render below),
  // which would otherwise wipe out chat state along with it.
  const chat = useSocketChat({
    organizationId,
    projectId: selectedProject?.id ?? DEFAULT_PROJECT_ID,
    userId,
  });

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const { user } = await getUserProfile();

        if (cancelled) return;

        setUserId(user.id);
        setUserEmail(user.email);

        const organizations = await listOrganizations();

        if (cancelled) return;

        const organization =
          (await findOrganizationWithActiveSubscription(organizations)) ??
          organizations[0];

        if (!organization) {
          setUserId(null);
          setUserEmail("");
          setOrganizationId(null);
          setSelectedProject(null);
          setCurrentScreen("signin");
          return;
        }

        if (cancelled) return;

        setOrganizationId(organization.id);

        const subscription = await getSubscriptionStatus(organization.id);

        if (cancelled) return;

        if (hasActiveSubscription(subscription)) {
          const savedProject = loadSelectedProject(organization.id);

          if (savedProject) {
            setSelectedProject(savedProject);
            setCurrentScreen("home");
          } else {
            setCurrentScreen("project-select");
          }
        } else {
          setCurrentScreen("subscription");
        }
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError && error.status === 401) {
          setUserId(null);
          setUserEmail("");
          setOrganizationId(null);
          setSelectedProject(null);
          setCurrentScreen("signin");
        } else {
          console.error(
            "Failed to restore authentication session:",
            error
          );

          setUserId(null);
          setUserEmail("");
          setOrganizationId(null);
          setSelectedProject(null);
          setCurrentScreen("signin");
        }
      } finally {
        if (!cancelled) {
          setIsRestoringSession(false);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Keeps the native status/nav bar icon color in sync with whichever screen is
  // showing, since it's one Activity/WebView across every React-level navigation.
  useEffect(() => {
    let cancelled = false;

    const desiredColor = DARK_HEADER_SCREENS.has(currentScreen)
      ? "light"
      : "dark";

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
  // some Android WebViews. tauri-plugin-m3 reads Android's real WindowInsets directly.
  useEffect(() => {
    let cancelled = false;

    const applySafeAreaInsets = async () => {
      const insets = await M3.getInsets();

      if (cancelled || !insets) return;

      const root = document.documentElement.style;

      if (insets.adjustedInsetTop != null) {
        root.setProperty(
          "--safe-top",
          `${insets.adjustedInsetTop}px`
        );
      }

      if (insets.adjustedInsetBottom != null) {
        root.setProperty(
          "--safe-bottom",
          `${insets.adjustedInsetBottom}px`
        );
      }

      if (insets.adjustedInsetLeft != null) {
        root.setProperty(
          "--safe-left",
          `${insets.adjustedInsetLeft}px`
        );
      }

      if (insets.adjustedInsetRight != null) {
        root.setProperty(
          "--safe-right",
          `${insets.adjustedInsetRight}px`
        );
      }
    };

    applySafeAreaInsets();

    window.addEventListener("resize", applySafeAreaInsets);
    window.addEventListener(
      "orientationchange",
      applySafeAreaInsets
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        "resize",
        applySafeAreaInsets
      );

      window.removeEventListener(
        "orientationchange",
        applySafeAreaInsets
      );
    };
  }, []);

  useEffect(() => {
    const handleFocus = (e: Event) => {
      const target = e.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA"
      ) {
        setIsKeyboardOpen(true);
      }
    };

    const handleBlur = (e: Event) => {
      const target = e.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA"
      ) {
        setIsKeyboardOpen(false);
      }
    };

    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);

    return () => {
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
    };
  }, []);

  // Applies the side effects a screen change needs without touching browser history.
  const applyScreenChange = (
    screen: Screen,
    fromScreen: Screen,
    payload?: any
  ) => {
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

  // Every real navigation pushes onto the WebView's own session history.
  const handleNavigate = (
    screen: string,
    payload?: any
  ) => {
    const nextScreen = screen as Screen;

    applyScreenChange(
      nextScreen,
      currentScreen,
      payload
    );

    window.history.pushState(
      {
        screen: nextScreen,
        payload,
      },
      ""
    );
  };

  // Syncs React state to whatever the browser/WebView just navigated to.
  useEffect(() => {
    window.history.replaceState(
      {
        screen: currentScreen,
      },
      ""
    );

    const handlePopState = (
      event: PopStateEvent
    ) => {
      const state = event.state as {
        screen?: Screen;
        payload?: any;
      } | null;

      if (!state?.screen) return;

      applyScreenChange(
        state.screen,
        currentScreenRef.current,
        state.payload
      );
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () =>
      window.removeEventListener(
        "popstate",
        handlePopState
      );

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div id="safe-area-top" />
      <div id="safe-area-bottom" />

      {currentScreen === "signin" && (
        <SignInScreen
          onNavigateToVerify={() =>
            handleNavigate("verify")
          }
          onNavigateToTerms={() =>
            handleNavigate("terms")
          }
          onNavigateToPrivacy={() =>
            handleNavigate("privacy")
          }
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
        <TermsOfServiceScreen
          onNavigate={handleNavigate}
          returnTo={previousScreen}
        />
      )}

      {currentScreen === "privacy" && (
        <PrivacyPolicyScreen
          onNavigate={handleNavigate}
          returnTo={previousScreen}
        />
      )}

      {currentScreen === "project-select" && (
        <ProjectSelectionScreen
          onNavigate={handleNavigate}
          organizationId={organizationId}
          onSelectProject={handleSelectProject}
        />
      )}

      {currentScreen === "subscription" && (
        <SubscriptionScreen
          onNavigate={handleNavigate}
          organizationId={organizationId}
        />
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
          onSelectOrganization={handleSelectOrganization}
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
          projectId={
            selectedProject?.id ??
            DEFAULT_PROJECT_ID
          }
        />
      )}

      {currentScreen === "agent-details" && (
        <AgentDetailsScreen
          onNavigate={handleNavigate}
          {...screenData}
        />
      )}

      {currentScreen === "outputs" && (
        <OutputsScreen
          onNavigate={handleNavigate}
          setSelectedOutput={(o) =>
            handleNavigate(
              "output-details",
              o
            )
          }
          isKeyboardOpen={isKeyboardOpen}
          projectId={
            selectedProject?.id ??
            DEFAULT_PROJECT_ID
          }
        />
      )}

      {currentScreen === "output-details" && (
        <OutputDetailScreen
          onNavigate={handleNavigate}
          output={screenData}
          projectId={
            selectedProject?.id ??
            DEFAULT_PROJECT_ID
          }
        />
      )}

      {currentScreen === "approvals" && (
        <ApprovalsScreen
          onNavigate={handleNavigate}
          isKeyboardOpen={isKeyboardOpen}
        />
      )}

      {currentScreen === "approval-details" && (
        <ApprovalDetailsScreen
          onNavigate={handleNavigate}
          approvalData={screenData}
        />
      )}

      {currentScreen === "transcript" && (
        <TranscriptScreen
          onNavigate={handleNavigate}
          {...transcriptPayload}
        />
      )}

      {currentScreen === "notifications" && (
        <NotificationsScreen
          onNavigate={handleNavigate}
        />
      )}

      {splashVisible && (
        <SplashScreen
          isFading={splashFading}
        />
      )}
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