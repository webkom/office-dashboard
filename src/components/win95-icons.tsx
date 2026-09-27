import React from "react";

// Windows 95 Flag Logo
export const Win95LogoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 16,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ imageRendering: "pixelated" }}
  >
    {/* Red tile */}
    <rect x="2" y="2" width="5" height="5" fill="#ff0000" />
    <rect x="2" y="2" width="5" height="1" fill="#ff7f7f" />
    <rect x="2" y="2" width="1" height="5" fill="#ff7f7f" />
    <rect x="6" y="2" width="1" height="5" fill="#800000" />
    <rect x="2" y="6" width="5" height="1" fill="#800000" />

    {/* Green tile */}
    <rect x="9" y="2" width="5" height="5" fill="#00aa00" />
    <rect x="9" y="2" width="5" height="1" fill="#7fff7f" />
    <rect x="9" y="2" width="1" height="5" fill="#7fff7f" />
    <rect x="13" y="2" width="1" height="5" fill="#005500" />
    <rect x="9" y="6" width="5" height="1" fill="#005500" />

    {/* Blue tile */}
    <rect x="2" y="9" width="5" height="5" fill="#0000ff" />
    <rect x="2" y="9" width="5" height="1" fill="#7f7fff" />
    <rect x="2" y="9" width="1" height="5" fill="#7f7fff" />
    <rect x="6" y="9" width="1" height="5" fill="#000080" />
    <rect x="2" y="13" width="5" height="1" fill="#000080" />

    {/* Yellow tile */}
    <rect x="9" y="9" width="5" height="5" fill="#ffaa00" />
    <rect x="9" y="9" width="5" height="1" fill="#ffff7f" />
    <rect x="9" y="9" width="1" height="5" fill="#ffff7f" />
    <rect x="13" y="9" width="1" height="5" fill="#805500" />
    <rect x="9" y="13" width="5" height="1" fill="#805500" />
  </svg>
);

// My Computer Desktop Icon
export const MyComputerIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 32, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ imageRendering: "pixelated" }}
  >
    {/* Monitor */}
    <rect
      x="3"
      y="3"
      width="22"
      height="17"
      fill="#c0c0c0"
      stroke="#000000"
      strokeWidth="1"
    />
    <rect x="4" y="4" width="20" height="1" fill="#ffffff" />
    <rect x="4" y="4" width="1" height="15" fill="#ffffff" />
    <rect
      x="6"
      y="6"
      width="16"
      height="11"
      fill="#008080"
      stroke="#808080"
      strokeWidth="1"
    />
    <rect x="7" y="7" width="14" height="9" fill="#000080" />
    <rect x="8" y="8" width="6" height="1" fill="#ffffff" />
    {/* Stand */}
    <rect
      x="11"
      y="20"
      width="6"
      height="3"
      fill="#808080"
      stroke="#000000"
      strokeWidth="1"
    />
    <rect
      x="8"
      y="23"
      width="12"
      height="2"
      fill="#c0c0c0"
      stroke="#000000"
      strokeWidth="1"
    />
    {/* Desktop Case */}
    <rect
      x="12"
      y="12"
      width="17"
      height="17"
      fill="#dfdfdf"
      stroke="#000000"
      strokeWidth="1"
    />
    <rect x="13" y="13" width="15" height="1" fill="#ffffff" />
    <rect
      x="15"
      y="15"
      width="11"
      height="3"
      fill="#808080"
      stroke="#000000"
      strokeWidth="1"
    />
    <rect x="15" y="16" width="7" height="1" fill="#000000" />
    <rect x="15" y="20" width="11" height="2" fill="#808080" />
    <circle cx="16" cy="25" r="1" fill="#00ff00" />
    <circle cx="20" cy="25" r="1" fill="#ff0000" />
  </svg>
);

// Network Neighborhood
export const NetworkIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ imageRendering: "pixelated" }}
  >
    {/* PC 1 */}
    <rect
      x="2"
      y="2"
      width="16"
      height="12"
      fill="#c0c0c0"
      stroke="#000"
      strokeWidth="1"
    />
    <rect x="5" y="4" width="10" height="7" fill="#000080" />
    <rect x="7" y="14" width="6" height="3" fill="#808080" />
    {/* PC 2 */}
    <rect
      x="14"
      y="10"
      width="16"
      height="12"
      fill="#c0c0c0"
      stroke="#000"
      strokeWidth="1"
    />
    <rect x="17" y="12" width="10" height="7" fill="#000080" />
    <rect x="19" y="22" width="6" height="3" fill="#808080" />
    {/* Cable */}
    <path d="M10 28H22M10 17V28M22 25V28" stroke="#000000" strokeWidth="2" />
    <rect x="8" y="27" width="16" height="2" fill="#ff0000" />
  </svg>
);

// Recycle Bin
export const RecycleBinIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 32, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ imageRendering: "pixelated" }}
  >
    {/* Bin Lid */}
    <rect
      x="6"
      y="4"
      width="20"
      height="3"
      fill="#808080"
      stroke="#000"
      strokeWidth="1"
    />
    <rect
      x="11"
      y="2"
      width="10"
      height="2"
      fill="#808080"
      stroke="#000"
      strokeWidth="1"
    />
    {/* Bin Body */}
    <path
      d="M7 7L9 28H23L25 7H7Z"
      fill="#c0c0c0"
      stroke="#000"
      strokeWidth="1"
    />
    {/* Ribs */}
    <line x1="12" y1="10" x2="12" y2="25" stroke="#808080" strokeWidth="2" />
    <line x1="16" y1="10" x2="16" y2="25" stroke="#808080" strokeWidth="2" />
    <line x1="20" y1="10" x2="20" y2="25" stroke="#808080" strokeWidth="2" />
    {/* Green recycle symbol */}
    <path
      d="M13 14L16 11L19 14M19 17L16 20L13 17"
      stroke="#008000"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

// Notepad Icon
export const NotepadIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ imageRendering: "pixelated" }}
  >
    {/* Notepad pad */}
    <rect
      x="5"
      y="4"
      width="22"
      height="25"
      fill="#ffffd0"
      stroke="#000000"
      strokeWidth="1"
    />
    <rect x="5" y="4" width="22" height="4" fill="#000080" />
    <line x1="8" y1="12" x2="24" y2="12" stroke="#808080" strokeWidth="1" />
    <line x1="8" y1="16" x2="24" y2="16" stroke="#808080" strokeWidth="1" />
    <line x1="8" y1="20" x2="24" y2="20" stroke="#808080" strokeWidth="1" />
    <line x1="8" y1="24" x2="18" y2="24" stroke="#808080" strokeWidth="1" />
    {/* Pencil */}
    <path
      d="M22 6L28 12L15 25L9 25L9 19L22 6Z"
      fill="#ffcc00"
      stroke="#000"
      strokeWidth="1"
    />
    <path d="M9 25L12 25L9 22Z" fill="#000000" />
  </svg>
);

// Brus Automat / Soda Can Icon
export const SodaCanIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ imageRendering: "pixelated" }}
  >
    <rect
      x="9"
      y="4"
      width="14"
      height="24"
      rx="2"
      fill="#ff0000"
      stroke="#000000"
      strokeWidth="1"
    />
    <ellipse
      cx="16"
      cy="4"
      rx="7"
      ry="2"
      fill="#dfdfdf"
      stroke="#000000"
      strokeWidth="1"
    />
    <ellipse
      cx="16"
      cy="28"
      rx="7"
      ry="2"
      fill="#800000"
      stroke="#000000"
      strokeWidth="1"
    />
    {/* Wave logo on can */}
    <path
      d="M10 14Q16 10 22 16Q16 22 10 18"
      stroke="#ffffff"
      strokeWidth="2"
      fill="none"
    />
    <text
      x="11"
      y="23"
      fill="#ffffff"
      fontSize="6"
      fontFamily="sans-serif"
      fontWeight="bold"
    >
      BRUS
    </text>
  </svg>
);

// Speaker Volume Tray Icon
export const SpeakerTrayIcon: React.FC<{ size?: number; muted?: boolean }> = ({
  size = 16,
  muted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ imageRendering: "pixelated" }}
  >
    <path d="M2 5H5L9 2V14L5 11H2V5Z" fill="#000000" />
    {!muted ? (
      <>
        <path
          d="M11 5C12 6.5 12 9.5 11 11"
          stroke="#000000"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M13 3C15 5.5 15 10.5 13 13"
          stroke="#000000"
          strokeWidth="1"
          fill="none"
        />
      </>
    ) : (
      <path d="M11 5L15 11M15 5L11 11" stroke="#ff0000" strokeWidth="1.5" />
    )}
  </svg>
);

// Network Activity Tray Icon
export const NetworkTrayIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ imageRendering: "pixelated" }}
  >
    <rect
      x="1"
      y="2"
      width="8"
      height="6"
      fill="#00aa00"
      stroke="#000"
      strokeWidth="1"
    />
    <rect
      x="7"
      y="6"
      width="8"
      height="6"
      fill="#00aa00"
      stroke="#000"
      strokeWidth="1"
    />
    <rect x="3" y="11" width="10" height="2" fill="#808080" />
  </svg>
);

// Windows 95 Hourglass Icon
export const HourglassIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ imageRendering: "pixelated" }}
  >
    <rect
      x="6"
      y="2"
      width="20"
      height="3"
      fill="#805500"
      stroke="#000"
      strokeWidth="1"
    />
    <rect
      x="6"
      y="27"
      width="20"
      height="3"
      fill="#805500"
      stroke="#000"
      strokeWidth="1"
    />
    <path d="M8 5L16 15L24 5H8Z" fill="#a0d0ff" stroke="#000" strokeWidth="1" />
    <path
      d="M8 27L16 17L24 27H8Z"
      fill="#a0d0ff"
      stroke="#000"
      strokeWidth="1"
    />
    {/* Sand */}
    <path d="M11 8L16 14L21 8H11Z" fill="#ffcc00" />
    <path d="M13 26L16 22L19 26H13Z" fill="#ffcc00" />
    <rect x="15" y="14" width="2" height="6" fill="#ffcc00" />
  </svg>
);
