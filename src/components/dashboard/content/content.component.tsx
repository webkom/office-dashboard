import React from "react";
import LoadingIcon from "app/components/loading-icon/loading-icon.component";
import CarouselInfo from "../carousel/carousel.component";

import MembersList from "app/components/members-list/members-list.component";
import { useDashboardData } from "app/hooks/dashboard-data.hook";
import StatusBar from "app/components/status-bar/status-bar.component";
import usePlayWelcomeMessageHook from "app/hooks/use-play-welcome-message.hook.ts";

const Content: React.FC = () => {
  const dasboardData = useDashboardData();

  usePlayWelcomeMessageHook(
    dasboardData.data?.members,
    dasboardData.data?.office_times,
  );

  const dataExists = dasboardData.isSuccess || !!dasboardData?.data

  return (
    <div className="g-width-full g-flex-col g-flex-align-center">
      <StatusBar />
      {dasboardData.isLoading ? (
        <LoadingIcon />
      ) : (
        <>
          {dataExists && (
            <>
              <CarouselInfo members={dasboardData.data.members} />
              <MembersList
                githubContributors={dasboardData.data.repository_contributors!}
                members={dasboardData.data.members}
                officeTimes={dasboardData.data.office_times ?? []}
                brus={dasboardData.data.brus ?? []}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Content;
