import React, { useState } from "react";
import {
  useDashboardData,
  RepositoryStats,
} from "app/hooks/dashboard-data.hook";
import bytes from "bytes";
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

export const Win95RepoStatsWindow: React.FC<Props> = ({
  isOpen,
  isActive = false,
  isMinimized = false,
  isMaximized = false,
  onFocus,
  onMinimize,
  onToggleMaximize,
  onClose,
}) => {
  const { data, refetch, isFetching } = useDashboardData();
  const [activeTab, setActiveTab] = useState<"lego" | "webapp" | "abakus_app">(
    "lego",
  );

  if (!isOpen || isMinimized) return null;

  const repoStats = data?.repository_stats as
    | Record<string, RepositoryStats>
    | undefined;
  const currentRepo = repoStats ? repoStats[activeTab] : null;

  const repoUrls = {
    lego: "https://github.com/webkom/lego",
    webapp: "https://github.com/webkom/lego-webapp",
    abakus_app: "https://github.com/webkom/abakus-app",
  };

  return (
    <DesktopWindow
      title={`GitHub Repo-statistikk - [${currentRepo?.name ?? activeTab}]`}
      icon={<span className="text-sm">🐙</span>}
      isActive={isActive}
      isMinimized={isMinimized}
      isMaximized={isMaximized}
      onFocus={onFocus}
      onMinimize={onMinimize}
      onToggleMaximize={onToggleMaximize}
      onClose={onClose}
    >
      <div className="p-3 bg-[#c0c0c0] flex flex-col gap-2 win95-font">
        {/* Tab Strip */}
        <div className="flex gap-1 border-b border-[#808080] pb-0 -mb-[1px] relative z-10">
          {(["lego", "webapp", "abakus_app"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-[12px] font-bold border-t-2 border-x-2 border-b-0 cursor-pointer ${
                activeTab === tab
                  ? "bg-[#c0c0c0] border-t-white border-l-white border-r-black border-b-[#c0c0c0] -mb-[1px] pb-1.5"
                  : "bg-[#b0b0b0] border-t-white border-l-white border-r-[#808080] text-gray-700"
              }`}
            >
              {tab === "lego"
                ? "Lego (Backend)"
                : tab === "webapp"
                  ? "Webapp (Frontend)"
                  : "Abakus App"}
            </button>
          ))}
        </div>

        {/* Tab Page Body */}
        <div className="win95-outset p-3 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black">
          {currentRepo ? (
            <div className="flex flex-col gap-3">
              {/* General Information */}
              <fieldset className="win95-groupbox">
                <legend>Generell informasjon</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] p-1">
                  <div>
                    <b>Navn:</b> {currentRepo.name}
                  </div>
                  <div>
                    <b>Stjerner:</b> {currentRepo.stars}
                  </div>
                  <div>
                    <b>Commits:</b>{" "}
                    {Number(currentRepo.commits).toLocaleString("no")}
                  </div>
                  <div>
                    <b>Diskforbruk:</b>{" "}
                    {bytes(currentRepo.disk_usage * 1024) ||
                      `${currentRepo.disk_usage} KB`}
                  </div>
                  <div>
                    <b>Gafler:</b> {currentRepo.forks}
                  </div>
                  <div>
                    <b>Siste dytt:</b>{" "}
                    {currentRepo.pushed_at
                      ? currentRepo.pushed_at.split("T")[0]
                      : "-"}
                  </div>
                </div>
              </fieldset>

              {/* Pull Requests & Issues */}
              <fieldset className="win95-groupbox">
                <legend>Pull Requests & Issues</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] p-1">
                  <div>
                    <b>Åpne PRer:</b> {currentRepo.pull_requests_open}
                  </div>
                  <div>
                    <b>Flettede PRer:</b> {currentRepo.pull_requests_merged}
                  </div>
                  <div>
                    <b>PRer totalt:</b> {currentRepo.pull_requests_total}
                  </div>
                  <div>
                    <b>Åpne problemer:</b> {currentRepo.issues_open}
                  </div>
                  <div>
                    <b>Lukkede problemer:</b> {currentRepo.issues_closed}
                  </div>
                  <div>
                    <b>Problemer totalt:</b> {currentRepo.issues_total}
                  </div>
                </div>
              </fieldset>

              <div className="flex justify-between items-center pt-1 text-[11px] text-gray-700">
                <span>
                  Opprettet:{" "}
                  {currentRepo.created_at
                    ? currentRepo.created_at.split("T")[0]
                    : "-"}
                </span>
                <a
                  href={repoUrls[activeTab]}
                  target="_blank"
                  rel="noreferrer"
                  className="win95-btn text-[11px]"
                >
                  Gå til GitHub ↗
                </a>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-600 italic">
              Laster inn statistikk for {activeTab}...
            </div>
          )}
        </div>
      </div>
    </DesktopWindow>
  );
};
