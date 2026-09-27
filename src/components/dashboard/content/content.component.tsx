import React from "react";
import LoadingIcon from "app/components/loading-icon/loading-icon.component";
import MembersList from "app/components/members-list/members-list.component";
import { useDashboardData } from "app/hooks/dashboard-data.hook";
import StatusBar from "app/components/status-bar/status-bar.component";
import usePlayWelcomeMessageHook from "app/hooks/use-play-welcome-message.hook.ts";

const Content: React.FC = () => {
  const dashboardData = useDashboardData();

  usePlayWelcomeMessageHook(
    dashboardData.data?.members,
    dashboardData.data?.office_times,
  );

  const dataExists = dashboardData.isSuccess || !!dashboardData?.data;

  if (dashboardData.isLoading) {
    return <LoadingIcon />;
  }

  if (dashboardData.isError && !dashboardData.data) {
    return (
      <div className="p-8 text-center win95-font">
        <div className="win95-outset p-4 max-w-md mx-auto bg-[#c0c0c0] flex flex-col gap-3">
          <div className="font-bold text-red-700 text-sm">
            Feil ved innlasting av data!
          </div>
          <p className="text-xs text-black">
            Kunne ikke koble til serveren på dashboard-backend.webkom.dev.
            Vennligst sjekk nettverkstilkoblingen eller Winsock-oppsettet.
          </p>
          <button
            onClick={() => dashboardData.refetch()}
            className="win95-btn mx-auto"
          >
            Prøv på nytt
          </button>
        </div>
      </div>
    );
  }

  if (!dataExists) {
    return <LoadingIcon />;
  }

  return (
    <div className="flex flex-col gap-0 w-full bg-[#c0c0c0]">
      {/* Uptime Robot Monitor Bar */}
      <StatusBar />

      {/* Members List Table */}
      <MembersList
        githubContributors={dashboardData.data.repository_contributors!}
        members={dashboardData.data.members}
        officeTimes={dashboardData.data.office_times ?? []}
        brus={dashboardData.data.brus ?? []}
      />
    </div>
  );
};

export default Content;
