import React, { useState } from "react";
import { NotepadIcon } from "./win95-icons";
import { DesktopWindow } from "./desktop-window";

type Props = {
  isOpen: boolean;
  isActive?: boolean;
  isMinimized?: boolean;
  isMaximized?: boolean;
  onFocus?: () => void;
  onMinimize?: () => void;
  onToggleMaximize?: () => void;
  onClose: () => void;
};

const defaultText = `=====================================================
  WEBKOM KONTOR DASHBOARD 95 (SPECIAL EDITION)
=====================================================

Velkommen til Webkom sitt kontor-dashboard!

Dette programmet overvåker aktiviteten på Webkom-kontoret,
viser hvem som er på kontoret akkurat nå, GitHub-bidrag
på Lego, Webapp og Abakus App, samt saldo i brusautomaten.

SYSTEMKRAV:
- Prosessor: Intel 80486DX2 66 MHz eller bedre
- Minne: 16 MB RAM (32 MB anbefales)
- Skjerm: Super VGA (800x600, 256 farger eller høyere)
- Nettverk: Novell NetWare / TCP/IP over Winsock 2.0

SNARVEIER:
- Klikk på en kolonne i tabellen for å sortere
- Klikk på et medlem for å markere raden i ekte 95-blå
- Bruk filterknappene for kun å se hvem som er på kontoret
- Dobbeltklikk på Repo Stats for å åpne repo-statistikk i eget vindu

Laget med kaffe og kjærlighet av Webkom!
-----------------------------------------------------
`;

export const Win95NotepadWindow: React.FC<Props> = ({
  isOpen,
  isActive = false,
  isMinimized = false,
  isMaximized = false,
  onFocus,
  onMinimize,
  onToggleMaximize,
  onClose,
}) => {
  const [content, setContent] = useState(defaultText);

  if (!isOpen || isMinimized) return null;

  const menuBar = (
    <div className="win95-menubar">
      <div className="win95-menu-item">
        <u>F</u>il
      </div>
      <div className="win95-menu-item">
        <u>R</u>ediger
      </div>
      <div className="win95-menu-item">
        <u>S</u>øk
      </div>
      <div className="win95-menu-item">
        <u>H</u>jelp
      </div>
    </div>
  );

  const statusBarPanes = [
    { content: <span>Linje 1, Kol 1</span> },
    { content: <span>Windows (CRLF)</span> },
    { content: <span>100%</span>, className: "ml-auto" },
  ];

  return (
    <DesktopWindow
      title="README.TXT - Notisblokk"
      icon={<NotepadIcon size={14} />}
      isActive={isActive}
      isMinimized={isMinimized}
      isMaximized={isMaximized}
      onFocus={onFocus}
      onMinimize={onMinimize}
      onToggleMaximize={onToggleMaximize}
      onClose={onClose}
      widthClass="max-w-xl"
      menuBar={menuBar}
      statusBarPanes={statusBarPanes}
    >
      <div className="p-1 bg-[#c0c0c0] h-72">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full win95-inset p-2 font-mono text-[12px] text-black bg-white resize-none outline-none win95-scroll"
          spellCheck={false}
        />
      </div>
    </DesktopWindow>
  );
};
