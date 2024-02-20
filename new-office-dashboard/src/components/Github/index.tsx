import React, { Component, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-refetch";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { GITHUB_STATS_URL } from "app/config";
import Repository from "app/components/Repository";
import LoadingIcon from "app/components/LoadingIcon";
import { useQuery } from "@tanstack/react-query";
import "./index.css";

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
  const {
    status: statusGithub,
    data: dataGithub,
    error: errorGithub,
  } = useQuery({
    queryKey: ["github"],
    queryFn: async () => {
      return (await fetch(GITHUB_STATS_URL)).json();
    },
  });

  const [repositories, setRepositories] = useState<unknown[]>([
    { name: "lego-webapp" },
  ]);

  useEffect(() => {
    if (!dataGithub) return;

    const newRepositories = Object.values(dataGithub.repositories);
    if (JSON.stringify(repositories) !== JSON.stringify(newRepositories)) {
      setRepositories(newRepositories);
    }
  }, [dataGithub]);

  // if (statusGithub == "pending") return <LoadingIcon />;

  return (
    <div className="github  g-flex-row g-height-full">
      {repositories?.map((repository) => (
        <Repository
          key={`repository-${repository.name}`}
          repository={repository}
        />
      ))}
      {repositories?.map((repository) => (
        <Repository
          key={`repository-${repository.name}`}
          repository={repository}
        />
      ))}
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
