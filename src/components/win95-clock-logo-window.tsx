import React, { useState, useEffect } from "react";
import webkomLogo from "/webkom.png";
import { DesktopWindow } from "./desktop-window";

type Props = {
  isActive?: boolean;
  onFocus?: () => void;
  className?: string;
};

export const Win95ClockLogoWindow: React.FC<Props> = ({
  isActive = false,
  onFocus,
  className = "",
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = now.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <DesktopWindow
      title="Webkom"
      icon={
        <img
          src={webkomLogo}
          alt="Webkom"
          className="w-4 h-4 object-contain inline-block"
        />
      }
      isActive={isActive}
      onFocus={onFocus}
      className={className}
    >
      <div className="p-3 bg-[#c0c0c0] win95-font flex items-center justify-between gap-4">
        {/* Webkom logo + Text "Webkom" */}
        <div className="flex items-center gap-3">
          <img
            src={webkomLogo}
            alt="Webkom"
            className="w-10 h-10 object-contain"
          />
          <span className="font-bold text-2xl text-black">Webkom</span>
        </div>

        {/* Digital clock in Windows 95 style: sunken white box, black text, zero glow */}
        <div className="win95-inset px-4 py-1.5 bg-white text-black font-mono text-2xl font-bold tracking-wider select-none">
          {timeString}
        </div>
      </div>
    </DesktopWindow>
  );
};
