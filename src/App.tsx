import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import SplashScreen from "./components/SplashScreen";
import SignInScreen from "./components/SignInScreen";
import VerifyEmailScreen from "./components/VerifyEmailScreen";
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
import "./App.css";
import "./theme.css";

const SPLASH_DURATION = 2500;
const SPLASH_FADE_DURATION = 800;

type Screen =
  | "signin"
  | "verify"
  | "terms"
  | "privacy"
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

const AppContent = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("signin");
  const [previousScreen, setPreviousScreen] = useState<DocumentScreen>("signin");
  const [userEmail, setUserEmail] = useState("");
  const [selectedOutput, setSelectedOutput] = useState<any | null>(null);
  const [screenData, setScreenData] = useState<any>(null);
  const [transcriptPayload, setTranscriptPayload] = useState<any>(null);

  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  const handleNavigate = (screen: Screen, payload?: any) => {
    if (
      currentScreen === "signin" ||
      currentScreen === "verify" ||
      currentScreen === "terms" ||
      currentScreen === "privacy"
    ) {
      setPreviousScreen(currentScreen);
    }
    if (screen === "transcript" && payload !== undefined) {
      setTranscriptPayload(payload);
    }
    if (payload !== undefined) {
      setScreenData(payload);
    }
    setCurrentScreen(screen);
  };

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
    <>
      {currentScreen === "signin" && (
        <SignInScreen
          onNavigateToVerify={() => handleNavigate("verify")}
          onNavigateToTerms={() => handleNavigate("terms")}
          onNavigateToPrivacy={() => handleNavigate("privacy")}
          setUserEmail={setUserEmail}
        />
      )}
      {currentScreen === "verify" && (
        <VerifyEmailScreen onNavigate={handleNavigate} userEmail={userEmail} />
      )}
      {currentScreen === "terms" && (
        <TermsOfServiceScreen onNavigate={handleNavigate} returnTo={previousScreen} />
      )}
      {currentScreen === "privacy" && (
        <PrivacyPolicyScreen onNavigate={handleNavigate} returnTo={previousScreen} />
      )}
      {currentScreen === "home" && (
        <HomeScreen onNavigate={handleNavigate} />
      )}
      {currentScreen === "agents" && (
        <AgentsScreen onNavigate={handleNavigate} />
      )}
      {currentScreen === "agent-details" && (
        <AgentDetailsScreen onNavigate={handleNavigate} />
      )}
      {currentScreen === "outputs" && (
        <OutputsScreen
          onNavigate={handleNavigate}
          setSelectedOutput={(o) => {
            setSelectedOutput(o);
            setCurrentScreen("output-details");
          }}
        />
      )}
      {currentScreen === "output-details" && (
        <OutputDetailScreen
          onNavigate={(screen: string) => handleNavigate(screen as Screen)}
          output={selectedOutput}
        />
      )}
      {currentScreen === "approvals" && (
        <ApprovalsScreen onNavigate={handleNavigate} />
      )}
      {currentScreen === "approval-details" && (
        <ApprovalDetailsScreen
          onNavigate={handleNavigate}
          approvalData={screenData}
        />
      )}
      {currentScreen === "transcript" && (
        <TranscriptScreen onNavigate={handleNavigate} payload={transcriptPayload} />
      )}
      {currentScreen === "notifications" && (
        <NotificationsScreen onNavigate={handleNavigate} />
      )}

      {splashVisible && <SplashScreen isFading={splashFading} />}
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;