import React from "react";
//import List from 'app/components/List';
//import LoadingIcon from 'app/components/LoadingIcon';
// import type { Theme } from "@material-ui/core/styles";
import LoadingIcon from "app/components/LoadingIcon";

// import MediaInfo from "../MediaInfo";
// import StatusBar from "../StatusBar";
import MembersList from "../MembersList/MembersList";
import { useDashboardData } from "app/hooks/useDashboardData";
import StatusBar from "../StatusBar";

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
