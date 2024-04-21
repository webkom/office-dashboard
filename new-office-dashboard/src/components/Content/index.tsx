import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { connect, PromiseState } from "react-refetch";
import { withStyles } from "@material-ui/core/styles";
import { PRESENCE_URL, BRUS_URL, KAFFE_URL } from "app/config.ts";
//import List from 'app/components/List';
//import LoadingIcon from 'app/components/LoadingIcon';
import type { Theme } from "@material-ui/core/styles";
import {
  useQuery,
  QueryClientProvider,
  useQueryClient,
  type QueryFunction,
} from "@tanstack/react-query";
import LoadingIcon from "app/components/LoadingIcon";

import MediaInfo from "../MediaInfo";
import StatusBar from "../StatusBar";
import MembersList from "../MembersList/MembersList";
import { useGithubContributors } from "app/hooks/useGithub";

const styles = (theme: Theme) => ({
  tableFooter: {
    textAlign: "center",
    paddingBottom: 0,
  },
  leftAlign: {
    textAlign: "left",
  },
  rightAlign: {
    textAlign: "right",
  },
  loading: {
    color: theme.palette.secondary.dark,
  },
  footer: {
    justifyContent: "space-between",
    display: "flex",
    width: "100%",
    marginBottom: 0,
    padding: "20px 0 0 0",
    fontSize: "0.65rem",
    opacity: 0.5,
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.45rem",
    },
  },
});

type ContentProps = {};

const Content: React.FC<ContentProps> = (props: ContentProps) => {
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastDatetime, setLastDatetime] = useState<Date | undefined>(undefined);
  const [members, setMembers] = useState<Array<any>>([]);

  const test = async () => {
    return (await fetch(PRESENCE_URL)).json();
  };

  const {
    status: statusPresence,
    data: dataPresence,
    error: errorPresence,
  } = useQuery({
    queryKey: ["presence"],
    queryFn: async () => {
      return (await fetch(PRESENCE_URL)).json();
    },
  });

  const {
    status: statusBrus,
    data: dataBrus,
    error: errorBrus,
  } = useQuery({
    queryKey: ["brus"],
    queryFn: async () => {
      return (await fetch(BRUS_URL)).json();
    },
  });

  const {
    status: statusKaffe,
    data: dataKaffe,
    error: errorKaffe,
  } = useQuery({
    queryKey: ["kaffe"],
    queryFn: async () => {
      return (await fetch(KAFFE_URL)).json();
    },
  });

  const allLoading = useMemo(
    () =>
      statusPresence === "pending" &&
      statusBrus === "pending" &&
      statusKaffe === "pending",
    [statusPresence, statusBrus, statusKaffe],
  );

  const githubContributorsQuery = useGithubContributors();

  const anyError =
    statusPresence === "error" ||
    statusBrus === "error" ||
    statusKaffe === "error";
  return (
    <div className="g-width-full">
      <MediaInfo />
      <StatusBar />
      {statusPresence === "success" ? dataPresence : statusPresence}
      {statusBrus === "success" ? dataBrus : statusBrus}
      {statusKaffe === "success" ? dataKaffe : statusKaffe}
      {githubContributorsQuery.isLoading ? (
        <LoadingIcon /> //TODO: ?? Make List take in fetch results individually?
      ) : (
        <MembersList githubContributors={githubContributorsQuery.data!} />
        // "<List members={members} brusData={dataBrus} kaffeData={dataKaffe} lastDatetime={lastDatetime} />"
      )}
    </div>
  );
};

export default Content;

// {

//       presence.members.map(member => {
//         // Brus
//         const brusInfo = brus.find(
//           brusMember => brusMember.name === member.brus
//         );
//         if (typeof brusInfo === 'undefined') {
//           member['brus_data'] = {
//             balance: '?',
//             purchase_summary: '?',
//             products_bought: '?'
//           };
//         } else {
//           member['brus_data'] = brusInfo;
//         }

//         // Kaffe
//         const kaffeInfo = kaffe.members.find(
//           kaffeMember => kaffeMember.name === member.name
//         );
//         if (typeof kaffeInfo === 'undefined') {
//           member['kaffe_data'] = {
//             jugs_brewed: '?',
//             volume_brewed: '?',
//             last_brew: '?'
//           };
//         } else {
//           member['kaffe_data'] = kaffeInfo;
//         }

//         return member;
//       });

//       if (
//         lastDatetime !== presence.last_datetime ||
//         JSON.stringify(members) !== JSON.stringify(presence.members)
//       ) {
//         this.setState({
//           lastDatetime: presence.last_datetime,
//           members: presence.members,
//           isLoading: false
//         });
//       }
//     }
//   }

// Content.propTypes = {
//   classes: PropTypes.object.isRequired,
//   presenceFetch: PropTypes.object.isRequired,
//   brusFetch: PropTypes.object.isRequired,
//   kaffeFetch: PropTypes.object.isRequired
// };

// export default withStyles(styles)(
//   connect(props => ({
//     presenceFetch: {
//       method: 'GET',
//       mode: 'cors',
//       url: PRESENCE_URL,
//       refreshInterval: 60000
//     },
//     brusFetch: {
//       method: 'GET',
//       mode: 'cors',
//       url: `${BRUS_URL}/api/liste/`,
//       refreshInterval: 60000
//     },
//     kaffeFetch: {
//       method: 'GET',
//       mode: 'cors',
//       url: KAFFE_URL,
//       refreshInterval: 60000
//     }
//   }))(Content)
// );
