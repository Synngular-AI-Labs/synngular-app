import React from "react";

interface UserRoundCheckIconProps {
  size?: number;
  style?: React.CSSProperties;
}

const UserRoundCheckIcon: React.FC<UserRoundCheckIconProps> = ({
  size = 24,
  style,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M2 21a8 8 0 0 1 13.292-6"/>
      <circle cx="10" cy="8" r="5"/>
      <path d="m16 19 2 2 4-4"/>
    </svg>
  );
};

export default UserRoundCheckIcon;
