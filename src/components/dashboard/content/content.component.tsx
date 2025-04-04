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
import usePlayWelcomeMessage from "app/hooks/usePlayWelcomeMessage.ts";

const Content: React.FC = () => {
  const dasboardData = useDashboardData();
  usePlayWelcomeMessage(
    dasboardData.data?.members,
    dasboardData.data?.office_times,
  );

  return (
    <div className="g-width-full g-flex-col g-flex-align-center">
      {/* <MediaInfo /> */}
      <StatusBar />
      {dasboardData.isLoading ? (
        <LoadingIcon />
      ) : (
        <>
          {dasboardData.isSuccess && (
            <>
              <CarouselInfo members={dasboardData.data.members} />
              <MembersList
                githubContributors={dasboardData.data.repository_contributors!}
                members={dasboardData.data.members}
                officeTimes={dasboardData.data.office_times}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Content;
