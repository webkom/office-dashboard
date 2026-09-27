import React from "react";

export type WindowStatusPane = {
  content: React.ReactNode;
  className?: string;
};

export type DesktopWindowProps = {
  id?: string;
  title: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  isMinimized?: boolean;
  isMaximized?: boolean;
  onFocus?: () => void;
  onMinimize?: () => void;
  onToggleMaximize?: () => void;
  onClose?: () => void;
  className?: string;
  widthClass?: string;
  menuBar?: React.ReactNode;
  toolbar?: React.ReactNode;
  statusBarPanes?: WindowStatusPane[];
  footer?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const DesktopWindow: React.FC<DesktopWindowProps> = ({
  title,
  icon,
  isActive = true,
  isMinimized = false,
  isMaximized = false,
  onFocus,
  onMinimize,
  onToggleMaximize,
  onClose,
  className = "",
  widthClass = "",
  menuBar,
  toolbar,
  statusBarPanes,
  footer,
  children,
  style,
}) => {
  if (isMinimized) return null;

  return (
    <div
      onClick={onFocus}
      style={{
        boxShadow: isMaximized
          ? "none"
          : "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px #808080, inset 2px 2px #dfdfdf, 4px 4px 12px rgba(0,0,0,0.5)",
        ...style,
      }}
      className={`win95-outset flex flex-col p-[3px] border border-black select-none transition-all duration-75 ${
        isMaximized
          ? "fixed inset-0 bottom-[30px] z-40 rounded-none w-full h-[calc(100vh-30px)]"
          : `w-full ${widthClass} mx-auto my-2 md:my-4`
      } ${className}`}
    >
      {/* Titlebar */}
      <div
        className={`win95-titlebar cursor-default ${isActive ? "" : "inactive"}`}
        onDoubleClick={onToggleMaximize}
      >
        <div className="win95-titlebar-title">
          {icon && <span className="inline-flex shrink-0">{icon}</span>}
          <span>{title}</span>
        </div>
        <div
          className="win95-titlebar-controls"
          onClick={(e) => e.stopPropagation()}
        >
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="win95-control-btn"
              title="Minimer"
            >
              _
            </button>
          )}
          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="win95-control-btn"
              title={isMaximized ? "Gjenopprett" : "Maksimer"}
            >
              {isMaximized ? "🗗" : "🗖"}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="win95-control-btn"
              title="Lukk"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Menubar (optional) */}
      {menuBar}

      {/* Toolbar (optional) */}
      {toolbar}

      {/* Main Window Body */}
      <div className="flex-1 bg-[#c0c0c0] p-1 overflow-y-auto win95-scroll">
        {children}
      </div>

      {/* Window Status Bar (optional) */}
      {statusBarPanes && statusBarPanes.length > 0 && (
        <div className="flex items-center gap-1 p-1 bg-[#c0c0c0] border-t border-[#808080] text-[11px] win95-font overflow-x-auto select-none">
          {statusBarPanes.map((pane, idx) => (
            <div
              key={idx}
              className={`win95-status-inset px-2 py-0.5 whitespace-nowrap ${
                pane.className ?? ""
              }`}
            >
              {pane.content}
            </div>
          ))}
        </div>
      )}

      {/* Window Footer (optional) */}
      {footer}
    </div>
  );
};
