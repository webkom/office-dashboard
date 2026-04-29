import React from "react";
//import List from 'app/components/List';
//import LoadingIcon from 'app/components/LoadingIcon';
// import type { Theme } from "@material-ui/core/styles";
import LoadingIcon from "app/components/loading-icon/loading-icon.component";
import CarouselInfo from "../carousel/carousel.component";

// import MediaInfo from "../MediaInfo";
// import StatusBar from "../StatusBar";
import MembersList from "app/components/members-list/members-list.component";
import { useDashboardData } from "app/hooks/dashboard-data.hook";
import StatusBar from "app/components/status-bar/status-bar.component";
import playWelcomeMessageHook from "app/hooks/play-welcome-message.hook.ts";

const Content: React.FC = () => {
  const dasboardData = useDashboardData();

  playWelcomeMessageHook(
    dasboardData.data?.members,
    dasboardData.data?.office_times,
  );

  // Use old data even if most recent call failed
  const dataExists = dasboardData.isSuccess || !!dasboardData?.data

  return (
    <div className="g-width-full g-flex-col g-flex-align-center">
      {/* <MediaInfo /> */}
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
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Content;
