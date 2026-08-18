import React from "react";
import logoSvg from "../assets/Mask group.svg";
import "./SplashScreen.css";

interface SplashScreenProps {
  isFading?: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isFading = false }) => {
  return (
    <div className={`splash-overlay${isFading ? " splash-fading" : ""}`}>
      <div className="splash-logo">
        <img src={logoSvg} alt="Syngular Logo" className="splash-logo-img" />
      </div>
    </div>
  );
};

export default SplashScreen;