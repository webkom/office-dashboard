import React, { useEffect, useState } from "react";
import { HourglassIcon } from "../win95-icons";

const logMessages = [
  "Initialiserer TCP/IP over Winsock 2.0...",
  "Kobler til dashboard-backend.webkom.dev...",
  "Laster medlemskartotek fra Abakus...",
  "Henter transaksjoner fra brusautomaten...",
  "Laster inn commits fra GitHub GraphQL...",
  "Klargjør kontorvisning...",
];

const LoadingIcon: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) =>
        prev < logMessages.length - 1 ? prev + 1 : prev,
      );
    }, 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4 win95-font select-none">
      <div className="win95-outset w-full max-w-md p-[3px] border border-black shadow-2xl">
        {/* Titlebar */}
        <div className="win95-titlebar">
          <div className="win95-titlebar-title">
            <span>⏳</span>
            <span>Starter Webkom Dashboard 95</span>
          </div>
          <div className="win95-titlebar-controls">
            <button className="win95-control-btn">✕</button>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="p-4 flex flex-col gap-4 bg-[#c0c0c0]">
          <div className="flex items-center gap-4">
            <div className="shrink-0 animate-bounce">
              <HourglassIcon size={40} />
            </div>
            <div>
              <h3 className="font-bold text-[13px] text-black">
                Webkom Kontor Dashboard
              </h3>
              <p className="text-[12px] text-gray-700">
                Vennligst vent mens programmet henter data...
              </p>
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="win95-progress">
            <div className="win95-progress-bar" />
          </div>

          {/* Status Box */}
          <div className="win95-inset p-2 h-20 overflow-y-auto font-mono text-[11px] text-black bg-white flex flex-col gap-0.5 win95-scroll">
            {logMessages.slice(0, currentStep + 1).map((msg, i) => (
              <div key={i} className="leading-tight">
                <span className="text-gray-500 font-bold">&gt; </span>
                {msg}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button className="win95-btn text-[12px] min-w-[75px]" disabled>
              Avbryt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIcon;
