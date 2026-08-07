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
import "./App.css";
import "./theme.css";

const SPLASH_DURATION = 2500;

type Screen = "splash" | "signin" | "verify" | "terms" | "privacy" | "home" | "agents" | "agent-details" | "outputs";

type DocumentScreen = "signin" | "verify" | "terms" | "privacy";

const AppContent = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [previousScreen, setPreviousScreen] = useState<DocumentScreen>("signin");
  const [userEmail, setUserEmail] = useState("");

  const handleNavigate = (screen: Screen) => {
    if (currentScreen === "signin" || currentScreen === "verify" || currentScreen === "terms" || currentScreen === "privacy") {
      setPreviousScreen(currentScreen);
    }
    setCurrentScreen(screen);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScreen("signin");
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {currentScreen === "splash" && <SplashScreen />}
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
        <OutputsScreen onNavigate={handleNavigate} />
      )}
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