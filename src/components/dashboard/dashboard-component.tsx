import React, { useState, useEffect } from "react";
import Content from "app/components/dashboard/content/content.component";
import { useDashboardData } from "app/hooks/dashboard-data.hook";
import webkomLogo from "/webkom.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { DesktopWindow, WindowStatusPane } from "../desktop-window";

type Props = {
  isActive?: boolean;
  onFocus?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
  onOpenAbout?: () => void;
  onOpenNotepad?: () => void;
  onOpenRepoStats?: () => void;
  onOpenShutdown?: () => void;
  isSoundMuted?: boolean;
  onToggleSound?: () => void;
};

const Dashboard: React.FC<Props> = ({
  isActive = true,
  onFocus,
  isMaximized = false,
  onToggleMaximize,
  isMinimized = false,
  onMinimize,
  onClose,
  onOpenAbout,
  onOpenNotepad,
  onOpenRepoStats,
  onOpenShutdown,
  isSoundMuted = false,
  onToggleSound,
}) => {
  const { data, refetch, isFetching } = useDashboardData();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("nb-NO", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = () => setOpenDropdown(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const activeCount =
    data?.office_times?.filter((ot) => ot.is_active)?.length ?? 0;
  const totalMembers = data?.members?.length ?? 0;

  // Menu bar definition
  const menuBar = (
    <div className="win95-menubar" onClick={(e) => e.stopPropagation()}>
      {/* Fil */}
      <div className="relative">
        <div
          onClick={() => setOpenDropdown(openDropdown === "fil" ? null : "fil")}
          className={`win95-menu-item ${openDropdown === "fil" ? "open" : ""}`}
        >
          <u>F</u>il
        </div>
        {openDropdown === "fil" && (
          <div className="win95-dropdown">
            <div
              className="win95-dropdown-item"
              onClick={() => {
                refetch();
                setOpenDropdown(null);
              }}
            >
              <span>Oppdater data</span>
              <span className="text-gray-500 font-mono text-[10px]">F5</span>
            </div>
            <div
              className="win95-dropdown-item"
              onClick={() => {
                window.print();
                setOpenDropdown(null);
              }}
            >
              <span>Skriv ut rapport...</span>
              <span className="text-gray-500 font-mono text-[10px]">
                Ctrl+P
              </span>
            </div>
            <div className="win95-dropdown-separator" />
            <div
              className="win95-dropdown-item font-bold"
              onClick={() => {
                setOpenDropdown(null);
                if (onOpenShutdown) onOpenShutdown();
              }}
            >
              <span>Avslutt</span>
              <span className="text-gray-500 font-mono text-[10px]">
                Alt+F4
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Rediger */}
      <div className="relative">
        <div
          onClick={() =>
            setOpenDropdown(openDropdown === "rediger" ? null : "rediger")
          }
          className={`win95-menu-item ${openDropdown === "rediger" ? "open" : ""}`}
        >
          <u>R</u>ediger
        </div>
        {openDropdown === "rediger" && (
          <div className="win95-dropdown">
            <div
              className="win95-dropdown-item"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert("Lenke kopiert til utklippstavlen!");
                setOpenDropdown(null);
              }}
            >
              <span>Kopier URL</span>
              <span className="text-gray-500 font-mono text-[10px]">
                Ctrl+C
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Vis */}
      <div className="relative">
        <div
          onClick={() => setOpenDropdown(openDropdown === "vis" ? null : "vis")}
          className={`win95-menu-item ${openDropdown === "vis" ? "open" : ""}`}
        >
          <u>V</u>is
        </div>
        {openDropdown === "vis" && (
          <div className="win95-dropdown">
            <div
              className="win95-dropdown-item"
              onClick={() => {
                setShowToolbar(!showToolbar);
                setOpenDropdown(null);
              }}
            >
              <span>{showToolbar ? "✓ " : "   "}Verktøylinje</span>
            </div>
            <div
              className="win95-dropdown-item"
              onClick={() => {
                if (onOpenRepoStats) onOpenRepoStats();
                setOpenDropdown(null);
              }}
            >
              <span>GitHub Repo-statistikk...</span>
            </div>
            <div className="win95-dropdown-separator" />
            <div
              className="win95-dropdown-item"
              onClick={() => {
                refetch();
                setOpenDropdown(null);
              }}
            >
              <span>Oppfrisk (Reload)</span>
            </div>
          </div>
        )}
      </div>

      {/* Kontor */}
      <div className="relative">
        <div
          onClick={() =>
            setOpenDropdown(openDropdown === "kontor" ? null : "kontor")
          }
          className={`win95-menu-item ${openDropdown === "kontor" ? "open" : ""}`}
        >
          <u>K</u>ontor
        </div>
        {openDropdown === "kontor" && (
          <div className="win95-dropdown">
            <a
              href="https://brus.abakus.no"
              target="_blank"
              rel="noreferrer"
              className="win95-dropdown-item"
              onClick={() => setOpenDropdown(null)}
            >
              <span>🥤 Åpne Brusautomat</span>
            </a>
            <a
              href="https://github.com/webkom"
              target="_blank"
              rel="noreferrer"
              className="win95-dropdown-item"
              onClick={() => setOpenDropdown(null)}
            >
              <span>🐙 Åpne Webkom GitHub</span>
            </a>
            <a
              href="https://kaffe-api.webkom.dev"
              target="_blank"
              rel="noreferrer"
              className="win95-dropdown-item"
              onClick={() => setOpenDropdown(null)}
            >
              <span>☕ Kaffetrakter Status</span>
            </a>
          </div>
        )}
      </div>

      {/* Hjelp */}
      <div className="relative">
        <div
          onClick={() =>
            setOpenDropdown(openDropdown === "hjelp" ? null : "hjelp")
          }
          className={`win95-menu-item ${openDropdown === "hjelp" ? "open" : ""}`}
        >
          <u>H</u>jelp
        </div>
        {openDropdown === "hjelp" && (
          <div className="win95-dropdown">
            <div
              className="win95-dropdown-item"
              onClick={() => {
                if (onOpenNotepad) onOpenNotepad();
                setOpenDropdown(null);
              }}
            >
              <span>📄 Les README.TXT...</span>
            </div>
            <div className="win95-dropdown-separator" />
            <div
              className="win95-dropdown-item"
              onClick={() => {
                if (onOpenAbout) onOpenAbout();
                setOpenDropdown(null);
              }}
            >
              <span>ℹ️ Om Webkom Dashboard 95...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Status bar panes
  const statusBarPanes: WindowStatusPane[] = [
    {
      content: (
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          <span>{isFetching ? "Laster inn data..." : "Klar"}</span>
        </span>
      ),
    },
    {
      content: (
        <span className="text-gray-700">
          Server: dashboard-backend.webkom.dev
        </span>
      ),
    },
    {
      content: (
        <span>
          <b className="text-black">{activeCount}</b> på kontoret /{" "}
          <b className="text-black">{totalMembers}</b> reg.
        </span>
      ),
    },
    {
      content: <span>Klokke: {currentTime}</span>,
      className: "ml-auto",
    },
  ];

  // Footer definition
  const footer = (
    <div className="text-center py-1 text-[11px] text-gray-600 bg-[#c0c0c0] border-t border-[#dfdfdf] win95-font">
      Laget med{" "}
      <FontAwesomeIcon className="text-amber-800" icon={faCoffee as IconProp} />{" "}
      av{" "}
      <a
        href="https://github.com/webkom/office-dashboard"
        target="_blank"
        rel="noreferrer"
        className="text-blue-800 underline hover:text-blue-600"
      >
        webkom
      </a>
    </div>
  );

  return (
    <DesktopWindow
      title="Dashbord"
      icon={
        <img
          src={webkomLogo}
          alt="Webkom"
          className="w-4 h-4 object-contain inline-block"
        />
      }
      isActive={isActive}
      isMinimized={isMinimized}
      isMaximized={isMaximized}
      onFocus={onFocus}
      onMinimize={onMinimize}
      onToggleMaximize={onToggleMaximize}
      onClose={onClose || onOpenShutdown}
      menuBar={menuBar}
      footer={footer}
    >
      <Content />
    </DesktopWindow>
  );
};

export default Dashboard;
