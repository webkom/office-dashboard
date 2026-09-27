import React from "react";
import webkomLogo from "/webkom.png";
import { Win95LogoIcon } from "./win95-icons";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const Win95AboutDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/30 p-4 win95-font select-none">
      <div className="win95-outset w-full max-w-md p-[3px] border border-black shadow-2xl">
        {/* Titlebar */}
        <div className="win95-titlebar">
          <div className="win95-titlebar-title">
            <Win95LogoIcon size={14} />
            <span>Om Webkom Kontor Dashboard</span>
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
            <div
              className="p-2 bg-white shrink-0"
              style={{
                boxShadow: "inset 1px 1px 0 #808080, inset -1px -1px 0 #fff",
                border: "1px solid #000",
              }}
            >
              <img
                src={webkomLogo}
                alt="Webkom"
                className="w-12 h-12 object-contain"
              />
            </div>

            <div className="flex flex-col gap-1 text-[12px]">
              <h2 className="font-bold text-[14px] text-black">
                Webkom Kontor Dashboard 95
              </h2>
              <div className="text-gray-700">
                Microsoft® Windows® 95 Edition
              </div>
              <div className="text-gray-700">
                Versjon 4.0.950B (Service Pack 1)
              </div>
              <div className="text-gray-700 text-[11px] mt-1">
                Copyright © 1995-2026 Webkom
              </div>
              <div className="text-gray-700 text-[11px]">
                Abakus Linjeforening, NTNU Gløshaugen
              </div>
            </div>
          </div>

          <div
            className="win95-inset p-3 bg-white text-[11px] text-black flex flex-col gap-1.5"
            style={{ maxHeight: "120px", overflowY: "auto" }}
          >
            <div>
              <b>Lisensiert til:</b> Webkom-medlem / Kontorsjef
            </div>
            <div>
              <b>Organisasjon:</b> Abakus Linjeforening
            </div>
            <div className="border-t border-gray-300 pt-1 mt-1">
              <b>Systemstatus:</b>
              <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                <li>Fysisk minne: 65,536 KB RAM (92% ledig)</li>
                <li>Brusautomat: Online via HTTP/1.1</li>
                <li>UptimeRobot: Overvåker Lego, Webapp, Wiki</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="win95-btn text-[12px] min-w-[80px] font-bold"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
