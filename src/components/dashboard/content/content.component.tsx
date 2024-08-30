import React from "react";
//import List from 'app/components/List';
//import LoadingIcon from 'app/components/LoadingIcon';
// import type { Theme } from "@material-ui/core/styles";
import LoadingIcon from "app/components/loading-icon/loading-icon.component";

// import MediaInfo from "../MediaInfo";
// import StatusBar from "../StatusBar";
import MembersList from "app/components/members-list/members-list.component";
import { useDashboardData } from "app/hooks/dashboard-data.hook";
import StatusBar from "app/components/status-bar/status-bar.component";

const Content: React.FC = () => {
  const dasboardData = useDashboardData();

  return (
    <div className="g-width-full g-flex-col g-flex-align-center">
      {/* <MediaInfo /> */}
      <StatusBar />
      {dasboardData.isLoading ? (
        <LoadingIcon />
      ) : (
        <>
          {dasboardData.isSuccess && (
            <MembersList
              githubContributors={dasboardData.data.repository_contributors!}
              members={dasboardData.data.members}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Content;
