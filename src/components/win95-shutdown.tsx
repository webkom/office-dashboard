import React, { useState } from "react";
import { MyComputerIcon } from "./win95-icons";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const Win95ShutdownDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  const [option, setOption] = useState<"shutdown" | "restart" | "dos">(
    "shutdown",
  );
  const [isShutDownScreen, setIsShutDownScreen] = useState(false);

  if (!isOpen) return null;

  if (isShutDownScreen) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center p-8 select-none win95-font">
        <h1 className="text-[#ff8800] text-3xl font-bold mb-4 font-mono text-center">
          Nå kan du slå av datamaskinen.
        </h1>
        <p className="text-gray-500 font-mono text-sm mb-8">
          It's now safe to turn off your computer.
        </p>
        <button
          onClick={() => {
            setIsShutDownScreen(false);
            onClose();
          }}
          className="win95-btn font-bold px-4 py-1"
        >
          Start på nytt (Reboot)
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/30 p-4 win95-font select-none">
      <div className="win95-outset w-full max-w-sm p-[3px] border border-black shadow-2xl">
        {/* Titlebar */}
        <div className="win95-titlebar">
          <div className="win95-titlebar-title">
            <span>Avslutt Windows</span>
          </div>
          <div className="win95-titlebar-controls">
            <button onClick={onClose} className="win95-control-btn">
              ✕
            </button>
          </div>
        </div>

        {/* Dialog Content */}
        <div className="p-4 bg-[#c0c0c0] flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <MyComputerIcon size={36} className="shrink-0" />
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-black">
                Hva vil du at datamaskinen skal gjøre?
              </span>

              <label className="flex items-center gap-2 text-[12px] cursor-pointer">
                <input
                  type="radio"
                  name="shutdown-choice"
                  checked={option === "shutdown"}
                  onChange={() => setOption("shutdown")}
                  className="accent-[#000080]"
                />
                <span>Slå av datamaskinen</span>
              </label>

              <label className="flex items-center gap-2 text-[12px] cursor-pointer">
                <input
                  type="radio"
                  name="shutdown-choice"
                  checked={option === "restart"}
                  onChange={() => setOption("restart")}
                  className="accent-[#000080]"
                />
                <span>Start datamaskinen på nytt</span>
              </label>

              <label className="flex items-center gap-2 text-[12px] cursor-pointer">
                <input
                  type="radio"
                  name="shutdown-choice"
                  checked={option === "dos"}
                  onChange={() => setOption("dos")}
                  className="accent-[#000080]"
                />
                <span>Start på nytt i MS-DOS-modus</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-400">
            <button
              onClick={() => {
                if (option === "shutdown") {
                  setIsShutDownScreen(true);
                } else {
                  window.location.reload();
                }
              }}
              className="win95-btn text-[12px] min-w-[70px] font-bold"
            >
              Ja
            </button>
            <button
              onClick={onClose}
              className="win95-btn text-[12px] min-w-[70px]"
            >
              Nei
            </button>
            <button
              onClick={() =>
                alert("Hjelp: Velg 'Slå av' for å slå av maskinen.")
              }
              className="win95-btn text-[12px] min-w-[70px]"
            >
              Hjelp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
