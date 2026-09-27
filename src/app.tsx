import { useState, useEffect } from "react";
import Dashboard from "./components/dashboard/dashboard-component";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Win95LogoIcon,
  MyComputerIcon,
  NetworkIcon,
  RecycleBinIcon,
  NotepadIcon,
  SodaCanIcon,
  SpeakerTrayIcon,
  NetworkTrayIcon,
} from "./components/win95-icons";
import { Win95AboutDialog } from "./components/win95-about";
import { Win95NotepadWindow } from "./components/win95-notepad";
import { Win95ShutdownDialog } from "./components/win95-shutdown";
import { Win95RepoStatsWindow } from "./components/win95-repo-stats";
import { Win95ClockLogoWindow } from "./components/win95-clock-logo-window";
import webkomLogo from "/webkom.png";

const queryClient = new QueryClient();

type WindowId = "dashboard" | "clock" | "repostats" | "notepad";

function DesktopEnvironment() {
  // Active window focus
  const [activeWindow, setActiveWindow] = useState<WindowId>("dashboard");

  // Window states: Dashboard
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [dashboardMinimized, setDashboardMinimized] = useState(false);
  const [dashboardMaximized, setDashboardMaximized] = useState(false);

  // Window states: Repo Stats (Separate program window!)
  const [repoStatsOpen, setRepoStatsOpen] = useState(true);
  const [repoStatsMinimized, setRepoStatsMinimized] = useState(false);
  const [repoStatsMaximized, setRepoStatsMaximized] = useState(false);

  // Window states: Notepad
  const [notepadOpen, setNotepadOpen] = useState(false);
  const [notepadMinimized, setNotepadMinimized] = useState(false);
  const [notepadMaximized, setNotepadMaximized] = useState(false);

  // System modals
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showShutdown, setShowShutdown] = useState(false);
  const [selectedDesktopIcon, setSelectedDesktopIcon] = useState<string | null>(
    null,
  );
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Helper to open and focus a window
  const openWindow = (id: WindowId) => {
    if (id === "dashboard") {
      setDashboardOpen(true);
      setDashboardMinimized(false);
    } else if (id === "repostats") {
      setRepoStatsOpen(true);
      setRepoStatsMinimized(false);
    } else if (id === "notepad") {
      setNotepadOpen(true);
      setNotepadMinimized(false);
    }
    setActiveWindow(id);
  };

  // Helper to toggle taskbar button click
  const handleTaskbarClick = (id: WindowId) => {
    if (id === "dashboard") {
      if (activeWindow === "dashboard" && !dashboardMinimized) {
        setDashboardMinimized(true);
      } else {
        setDashboardMinimized(false);
        setActiveWindow("dashboard");
      }
    } else if (id === "repostats") {
      if (activeWindow === "repostats" && !repoStatsMinimized) {
        setRepoStatsMinimized(true);
      } else {
        setRepoStatsMinimized(false);
        setActiveWindow("repostats");
      }
    } else if (id === "notepad") {
      if (activeWindow === "notepad" && !notepadMinimized) {
        setNotepadMinimized(true);
      } else {
        setNotepadMinimized(false);
        setActiveWindow("notepad");
      }
    }
  };

  // Live Clock in Taskbar
  const [clockString, setClockString] = useState("");
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClockString(
        now.toLocaleTimeString("nb-NO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close Start menu on background click
  useEffect(() => {
    const handleClick = () => {
      setShowStartMenu(false);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      className="min-h-screen bg-[#008080] text-black win95-font select-none overflow-x-hidden relative pb-12 flex flex-col"
      onClick={() => setSelectedDesktopIcon(null)}
    >
      {/* Desktop Workspace */}
      <div className="flex-1 flex flex-col md:flex-row p-2 gap-3 relative">
        {/* Desktop Icons Column */}
        <div
          className="flex md:flex-col flex-wrap gap-2 z-10 shrink-0 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* My Computer */}
          <div
            onClick={() => setSelectedDesktopIcon("computer")}
            onDoubleClick={() =>
              alert(
                'Min Datamaskin:\nC: WEB_OS (FAT32) - 1.2 GB ledig\nA: 3.5" Diskett',
              )
            }
            className={`win95-desktop-icon ${
              selectedDesktopIcon === "computer" ? "selected" : ""
            }`}
          >
            <MyComputerIcon size={32} />
            <span className="win95-desktop-icon-label">Min Datamaskin</span>
          </div>

          {/* Network Neighborhood */}
          <div
            onClick={() => setSelectedDesktopIcon("network")}
            onDoubleClick={() =>
              alert(
                "Nettverksnabolag:\n- ABAKUS-KONTOR\n- BRUS-SERVER\n- KAFFETRAKTER",
              )
            }
            className={`win95-desktop-icon ${
              selectedDesktopIcon === "network" ? "selected" : ""
            }`}
          >
            <NetworkIcon size={32} />
            <span className="win95-desktop-icon-label">Nettverk</span>
          </div>

          {/* Webkom Dashboard App Shortcut */}
          <div
            onClick={() => {
              setSelectedDesktopIcon("dashboard");
              openWindow("dashboard");
            }}
            onDoubleClick={() => openWindow("dashboard")}
            className={`win95-desktop-icon ${
              selectedDesktopIcon === "dashboard" ? "selected" : ""
            }`}
          >
            <div className="relative">
              <img
                src={webkomLogo}
                alt="Webkom"
                className="w-8 h-8 object-contain"
              />
              {/* Shortcut Arrow Badge */}
              <span className="absolute -bottom-1 -left-1 text-[10px] bg-white text-black border border-black px-0.5 leading-none">
                ↗
              </span>
            </div>
            <span className="win95-desktop-icon-label">Webkom Kontor</span>
          </div>

          {/* Repo Stats App Shortcut */}
          <div
            onClick={() => {
              setSelectedDesktopIcon("repostats");
              openWindow("repostats");
            }}
            onDoubleClick={() => openWindow("repostats")}
            className={`win95-desktop-icon ${
              selectedDesktopIcon === "repostats" ? "selected" : ""
            }`}
          >
            <div className="relative text-3xl leading-none">
              🐙
              <span className="absolute -bottom-1 -left-1 text-[10px] bg-white text-black border border-black px-0.5 leading-none">
                ↗
              </span>
            </div>
            <span className="win95-desktop-icon-label">Statistikk</span>
          </div>

          {/* Brusautomat */}
          <div
            onClick={() => setSelectedDesktopIcon("brus")}
            onDoubleClick={() =>
              window.open("https://brus.abakus.no", "_blank")
            }
            className={`win95-desktop-icon ${
              selectedDesktopIcon === "brus" ? "selected" : ""
            }`}
          >
            <SodaCanIcon size={32} />
            <span className="win95-desktop-icon-label">Brusautomat</span>
          </div>

          {/* README.TXT */}
          <div
            onClick={() => {
              setSelectedDesktopIcon("readme");
              openWindow("notepad");
            }}
            onDoubleClick={() => openWindow("notepad")}
            className={`win95-desktop-icon ${
              selectedDesktopIcon === "readme" ? "selected" : ""
            }`}
          >
            <NotepadIcon size={32} />
            <span className="win95-desktop-icon-label">README.TXT</span>
          </div>

          {/* Recycle Bin */}
          <div
            onClick={() => setSelectedDesktopIcon("recycle")}
            onDoubleClick={() => alert("Papirkurven er tom.")}
            className={`win95-desktop-icon ${
              selectedDesktopIcon === "recycle" ? "selected" : ""
            }`}
          >
            <RecycleBinIcon size={32} />
            <span className="win95-desktop-icon-label">Papirkurv</span>
          </div>
        </div>

        {/* Windows Workspace Canvas */}
        <div className="flex-1 flex flex-col items-center justify-start gap-3 relative min-h-0">
          {/* Main Dashboard Window */}
          {dashboardOpen && (
            <div
              className={`w-full ${
                activeWindow === "dashboard" ? "z-30" : "z-20"
              }`}
            >
              <Dashboard
                isActive={activeWindow === "dashboard"}
                onFocus={() => setActiveWindow("dashboard")}
                isMaximized={dashboardMaximized}
                onToggleMaximize={() =>
                  setDashboardMaximized(!dashboardMaximized)
                }
                isMinimized={dashboardMinimized}
                onMinimize={() => setDashboardMinimized(true)}
                onClose={() => setDashboardOpen(false)}
                onOpenAbout={() => setShowAbout(true)}
                onOpenNotepad={() => openWindow("notepad")}
                onOpenRepoStats={() => openWindow("repostats")}
                onOpenShutdown={() => setShowShutdown(true)}
                isSoundMuted={isSoundMuted}
                onToggleSound={() => setIsSoundMuted(!isSoundMuted)}
              />
            </div>
          )}

          <div className="flex flex-row gap-5 w-full">
            {/* Webkom Logo & Digital Clock Window - ALWAYS visible below the member list window */}

            <div
              className={`w-full ${activeWindow === "clock" ? "z-30" : "z-20"}`}
            >
              <Win95ClockLogoWindow
                isActive={activeWindow === "clock"}
                onFocus={() => setActiveWindow("clock")}
              />
            </div>

            {/* Separate Program Window: GitHub Repo Stats */}
            {repoStatsOpen && (
              <div
                className={`w-full ${
                  activeWindow === "repostats" ? "z-30" : "z-20"
                }`}
              >
                <Win95RepoStatsWindow
                  isOpen={repoStatsOpen}
                  isActive={activeWindow === "repostats"}
                  onFocus={() => setActiveWindow("repostats")}
                  isMinimized={repoStatsMinimized}
                  onMinimize={() => setRepoStatsMinimized(true)}
                  isMaximized={repoStatsMaximized}
                  onToggleMaximize={() =>
                    setRepoStatsMaximized(!repoStatsMaximized)
                  }
                  onClose={() => setRepoStatsOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Separate Program Window: Notepad (README.TXT) */}
          {notepadOpen && (
            <div
              className={`w-full ${
                activeWindow === "notepad" ? "z-30" : "z-20"
              }`}
            >
              <Win95NotepadWindow
                isOpen={notepadOpen}
                isActive={activeWindow === "notepad"}
                onFocus={() => setActiveWindow("notepad")}
                isMinimized={notepadMinimized}
                onMinimize={() => setNotepadMinimized(true)}
                isMaximized={notepadMaximized}
                onToggleMaximize={() => setNotepadMaximized(!notepadMaximized)}
                onClose={() => setNotepadOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Windows 95 Taskbar */}
      <div className="win95-taskbar" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {/* Start Button */}
          <button
            onClick={() => setShowStartMenu(!showStartMenu)}
            className={`win95-start-btn ${showStartMenu ? "active" : ""}`}
          >
            <Win95LogoIcon size={16} />
            <span>Start</span>
          </button>

          {/* Taskbar Button for Webkom Dashboard */}
          {dashboardOpen && (
            <button
              onClick={() => handleTaskbarClick("dashboard")}
              className={`win95-task-btn ${
                activeWindow === "dashboard" && !dashboardMinimized
                  ? "win95-status-inset font-bold"
                  : "win95-btn"
              }`}
              title="Webkom Kontor Dashboard 95"
            >
              <img
                src={webkomLogo}
                alt="Webkom"
                className="w-3.5 h-3.5 object-contain shrink-0"
              />
              <span className="truncate">Dashbord</span>
            </button>
          )}

          {/* Taskbar Button for Webkom Klokke og Logo */}
          <button
            onClick={() => setActiveWindow("clock")}
            className={`win95-task-btn ${
              activeWindow === "clock"
                ? "win95-status-inset font-bold"
                : "win95-btn"
            }`}
            title="Webkom Klokke og Logo"
          >
            <span className="truncate">Klokke</span>
          </button>

          {/* Taskbar Button for GitHub Repo Stats (Separate Window!) */}
          {repoStatsOpen && (
            <button
              onClick={() => handleTaskbarClick("repostats")}
              className={`win95-task-btn ${
                activeWindow === "repostats" && !repoStatsMinimized
                  ? "win95-status-inset font-bold"
                  : "win95-btn"
              }`}
              title="GitHub Repo-statistikk"
            >
              <span className="truncate">Statistikk</span>
            </button>
          )}

          {/* Taskbar Button for Notepad if open */}
          {notepadOpen && (
            <button
              onClick={() => handleTaskbarClick("notepad")}
              className={`win95-task-btn ${
                activeWindow === "notepad" && !notepadMinimized
                  ? "win95-status-inset font-bold"
                  : "win95-btn"
              }`}
              title="README.TXT - Notisblokk"
            >
              <NotepadIcon size={14} />
              <span className="truncate">README.TXT</span>
            </button>
          )}
        </div>

        {/* System Tray */}
        <div className="win95-tray">
          <button
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            title={
              isSoundMuted
                ? "Lyd er dempet (Klikk for å aktivere)"
                : "Lyd er aktiv (Klikk for å dempe)"
            }
            className="hover:opacity-80 cursor-pointer"
          >
            <SpeakerTrayIcon size={14} muted={isSoundMuted} />
          </button>
          <NetworkTrayIcon size={14} />
          <span className="font-mono text-[11px] font-bold tracking-tight">
            {clockString}
          </span>
        </div>
      </div>

      {/* Windows 95 Start Menu */}
      {showStartMenu && (
        <div className="win95-startmenu" onClick={(e) => e.stopPropagation()}>
          <div className="win95-startmenu-sidebar">
            Windows<span>95</span>
          </div>

          <div className="win95-startmenu-items">
            {/* Programmer */}
            <div
              className="win95-startmenu-item"
              onClick={() => {
                openWindow("dashboard");
                setShowStartMenu(false);
              }}
            >
              <span className="text-base">📁</span>
              <span className="font-bold">Webkom Dashboard</span>
            </div>

            {/* Repo Stats */}
            <div
              className="win95-startmenu-item"
              onClick={() => {
                openWindow("repostats");
                setShowStartMenu(false);
              }}
            >
              <span className="text-base">🐙</span>
              <span>GitHub Repo-statistikk</span>
            </div>

            {/* Brusautomat */}
            <a
              href="https://brus.abakus.no"
              target="_blank"
              rel="noreferrer"
              className="win95-startmenu-item"
              onClick={() => setShowStartMenu(false)}
            >
              <span className="text-base">🥤</span>
              <span>Brusautomat</span>
            </a>

            {/* Dokumenter */}
            <div
              className="win95-startmenu-item"
              onClick={() => {
                openWindow("notepad");
                setShowStartMenu(false);
              }}
            >
              <span className="text-base">📄</span>
              <span>README.TXT</span>
            </div>

            {/* Innstillinger / Lyd */}
            <div
              className="win95-startmenu-item"
              onClick={() => {
                setIsSoundMuted(!isSoundMuted);
                setShowStartMenu(false);
              }}
            >
              <span className="text-base">⚙️</span>
              <span>
                {isSoundMuted ? "Aktiver velkomstlyd" : "Demp velkomstlyd"}
              </span>
            </div>

            <div className="win95-dropdown-separator my-1" />

            {/* Om Webkom */}
            <div
              className="win95-startmenu-item"
              onClick={() => {
                setShowAbout(true);
                setShowStartMenu(false);
              }}
            >
              <span className="text-base">ℹ️</span>
              <span>Om Webkom Dashboard...</span>
            </div>

            <div className="win95-dropdown-separator my-1" />

            {/* Slå av maskinen */}
            <div
              className="win95-startmenu-item font-bold"
              onClick={() => {
                setShowShutdown(true);
                setShowStartMenu(false);
              }}
            >
              <span className="text-base">🛑</span>
              <span>Slå av maskinen...</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialogs */}
      <Win95AboutDialog
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />
      <Win95ShutdownDialog
        isOpen={showShutdown}
        onClose={() => setShowShutdown(false)}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DesktopEnvironment />
    </QueryClientProvider>
  );
}

export default App;
