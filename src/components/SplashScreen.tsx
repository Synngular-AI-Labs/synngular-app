import React from "react";
import logoSvg from "../assets/Mask group.svg";
import "./SplashScreen.css";

const SplashScreen: React.FC = () => {
  return (
    <div className="splash-overlay">
      <div className="splash-logo">
        <img src={logoSvg} alt="Syngular Logo" className="splash-logo-img" />
      </div>
    </div>
  );
};

export default SplashScreen;