import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import SplashScreen from "./components/SplashScreen";
import SignInScreen from "./components/SignInScreen";
import VerifyEmailScreen from "./components/VerifyEmailScreen";
import "./App.css";
import "./theme.css";

const SPLASH_DURATION = 2500;

type Screen = "splash" | "signin" | "verify";

const AppContent = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScreen("signin");
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {currentScreen === "splash" && <SplashScreen />}
      {currentScreen === "signin" && <SignInScreen onNavigateToVerify={() => setCurrentScreen("verify")} />}
      {currentScreen === "verify" && <VerifyEmailScreen />}
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