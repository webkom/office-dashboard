import React from "react";
import LoadingIcon from "app/components/loading-icon/loading-icon.component";
import CarouselInfo from "../carousel/carousel.component";

import MembersList from "app/components/members-list/members-list.component";
import { useDashboardData } from "app/hooks/dashboard-data.hook";
import StatusBar from "app/components/status-bar/status-bar.component";
import usePlayWelcomeMessageHook from "app/hooks/use-play-welcome-message.hook.ts";
import { AnimatePresence } from "motion/react";

const Content: React.FC = () => {
  const dashboardData = useDashboardData();

  usePlayWelcomeMessageHook(
    dashboardData.data?.members,
    dashboardData.data?.office_times,
  );

  const dataExists = dashboardData.isSuccess || !!dashboardData?.data;

  return (
    <div className="">
      {/* <StatusBar /> */}
      <AnimatePresence mode="wait">
        {dashboardData.isLoading ? (
          <LoadingIcon />
        ) : (
          dataExists && (
            <>
              <StatusBar />
              <MembersList
                githubContributors={dashboardData.data.repository_contributors!}
                members={dashboardData.data.members}
                officeTimes={dashboardData.data.office_times ?? []}
                brus={dashboardData.data.brus ?? []}
              />
            </>
          )
        )}
      </AnimatePresence>
      {/* {dasboardData.isLoading ? (
        <LoadingIcon />
      ) : (
        <>
          {dataExists && (
            <>
              <CarouselInfo members={dasboardData.data.members} />
              
            </>
          )}
        </>
      )} */}
    </div>
  );
};

export default Content;
