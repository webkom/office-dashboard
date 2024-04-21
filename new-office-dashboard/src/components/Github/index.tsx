import React, { Component, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-refetch";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Repository from "app/components/Repository";
import LoadingIcon from "app/components/LoadingIcon";
import { useQuery } from "@tanstack/react-query";
import "./index.css";
import { useGithubStats } from "app/hooks/useGithub";

// const styles = theme => ({
//   root: {
//     flexGrow: 1
//   },
//   grow: {
//     flexGrow: 1
//   },
//   loading: {
//     color: theme.palette.secondary.dark
//   }
// });

const Github = () => {
  const { data, isLoading } = useGithubStats();

  if (isLoading) return <div>asdf</div>;

  const loadingStatsObjects = {
    name: "loading",
    created_at: "loading",
    updated_at: "loading",
    pushed_at: "loading",
    forks: "loading",
    stars: "loading",
    disk_usage: "loading",
    watchers: "loading",
    commits: "loading",
    commit_comments: "loading",
    pull_requests_total: "loading",
    pull_requests_merged: "loading",
    pull_requests_open: "loading",
    pull_requests_closed: "loading",
    issues_total: "loading",
    issues_open: "loading",
    issues_closed: "loading",
  };

  return (
    <div className="github  g-flex-row g-height-full">
      <Repository
        key={"repository-lego"}
        repository={data === undefined ? loadingStatsObjects : data["lego"]}
      />
      <Repository
        key={"repository-webapp"}
        repository={data === undefined ? loadingStatsObjects : data["lego"]}
      />
    </div>
  );
};

// export class Github extends Component {
//   state = {
//     isLoading: true,
//     lastDatetime: null,
//     repositories: null
//   };

//   componentDidUpdate(prevProps) {
//     const { apiFetch } = this.props;
//     const { isLoading, repositories } = this.state;

//     if (!isLoading && apiFetch.pending) {
//       this.setState({ isLoading: true });
//     } else if (isLoading && apiFetch.rejected) {
//       // throw apiFetch.reason.message;
//     } else if (apiFetch.fulfilled) {
//       const response = apiFetch.value;
//       const newRepositories = Object.values(response.repositories);

//       if (JSON.stringify(repositories) !== JSON.stringify(newRepositories)) {
//         const newState = {
//           lastDatetime: response.last_datetime,
//           isLoading: false,
//           repositories: newRepositories
//         };
//         this.setState(newState);
//       }
//     }
//   }

//   render() {
//     const { isLoading, repositories } = this.state;

//     const repositoryWidth =
//       repositories !== null && repositories.length > 0
//         ? 100 / repositories.length
//         : 100;

//     return (
//       <Grid item container alignItems={'center'} justify={'center'}>
//         {isLoading ? (
//           <LoadingIcon size={4} />
//         ) : (
//           <Grid
//             item
//             container
//             justify={'space-evenly'}
//             style={{ flexWrap: 'nowrap' }}
//           >
//             {repositories.map(repository => (
//               <Repository
//                 containerWidth={repositoryWidth}
//                 key={`repository-${repository.name}`}
//                 repository={repository}
//               />
//             ))}
//           </Grid>
//         )}
//       </Grid>
//     );
//   }
// }

// Github.propTypes = {
//   classes: PropTypes.object.isRequired,
//   apiFetch: PropTypes.object.isRequired
// };

// export default withStyles(styles)(
//   connect(props => ({
//     apiFetch: {
//       method: 'GET',
//       mode: 'cors',
//       url: GITHUB_STATS_URL,
//       refreshInterval: 5000
//     }
//   }))(Github)
// );

export default Github;
