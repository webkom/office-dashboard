import bytes from "bytes";
// import PropTypes from "prop-types";
// import withWidth from "@material-ui/core/withWidth";
// import { withStyles } from "@material-ui/core/styles";
// import Grid from "@material-ui/core/Grid";
import {
  HistoryIcon,
  GitPullRequestIcon,
  StarIcon,
  IssueOpenedIcon,
  IssueClosedIcon,
  GitMergeIcon,
  DatabaseIcon,
} from "@primer/octicons-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
// import Table from "app/components/Table";
// import TableHeader from "app/components/Table/Header";
// import TableBody from "app/components/Table/Body";
// import TableColumn from "app/components/Table/Column";
// import Stats from "app/components/Github/Stats";
import styles from "./repository.module.css";
import RepositoryStatistic from "../repository-statistic/repository-statistic.component";
import React from "react";
import { RepositoryStats } from "app/hooks/dashboard-data.hook";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

const Repository: React.FC<{ repository: RepositoryStats }> = (props) => {
  const {
    // classes,
    // width,
    repository: {
      name,
      commits,
      issues_open,
      pull_requests_open,
      stars,
      issues_closed,
      pull_requests_merged,
      disk_usage,
      updated_at,
    },
  } = props;
  const formattedName = name.replace("webkom/", "").replace("lego-", "");
  // const isLarge = width !== undefined && ["lg", "xl"].includes(width);
  const statsItems = [
    {
      name: "Commits",
      icon: HistoryIcon,
      value: Number(commits).toLocaleString("en"),
    },
    {
      name: "PRs",
      icon: GitPullRequestIcon,
      value: Number(pull_requests_open).toLocaleString("en"),
    },
    {
      name: "Stars",
      icon: StarIcon,
      value: Number(stars).toLocaleString("en"),
    },
  ];
  const extraStatsItems = [
    {
      name: "Merged PRs",
      icon: GitMergeIcon,
      value: Number(pull_requests_merged).toLocaleString("en"),
    },
    {
      name: "Diskforbruk",
      icon: DatabaseIcon,
      value: bytes(disk_usage * 1024),
    },
    {
      name: "Siste Push",
      icon: HistoryIcon,
      value: new Date(updated_at).toISOString().split("T")[0],
    },
  ];
  if (formattedName !== "webapp") {
    statsItems.push({
      name: "Issues",
      icon: IssueOpenedIcon,
      value: Number(issues_open).toLocaleString("en"),
    });
    extraStatsItems.push({
      name: "Lukkede Issues",
      icon: IssueClosedIcon,
      value: Number(issues_closed).toLocaleString("en"),
    });
  }

  const maxItems = 4;
  const statsHeight = 100 / maxItems;
  return (
    <>
      <div className={`${styles["repo"]} g-flex g-flex-col g-height-full`}>
        <div
          className={`${styles["repo-header"]} g-flex-row g-flex-justify-center g-table-header-border`}
        >
          <FontAwesomeIcon
            className={styles["github-icon"]}
            icon={faGithub as IconProp}
          />
          <span>{formattedName}</span>
        </div>
        <div className={`${styles["repo-columns"]} g-flex g-flex-row`}>
          <div
            className={`${styles["repo-column-left"]} g-flex-col g-table-column-border`}
          >
            {statsItems.map(({ name, icon, value }) => (
              <RepositoryStatistic
                key={`github-stats-${name}`}
                height={statsHeight}
                name={name}
                Icon={icon}
                value={value}
              />
            ))}
            {Array.from({ length: maxItems - statsItems.length }, (_, i) => (
              <div
                className="g-flex"
                key={i}
                style={{ height: `${statsHeight}%` }}
              ></div>
            ))}
          </div>
          <div className="repo-column-right  g-flex-col g-table-column-border">
            {extraStatsItems.map(({ name, icon, value }) => (
              <RepositoryStatistic
                key={`github-stats-${name}`}
                height={statsHeight}
                name={name}
                Icon={icon}
                value={value}
              />
            ))}
            {extraStatsItems.length < maxItems &&
              Array(maxItems - statsItems.length).map((i) => (
                <span className="g-flex" key={i}></span>
              ))}
          </div>
        </div>
      </div>
      {/* <Table xs={6}>
      <TableHeader height={statsHeight}>
        <FontAwesomeIcon className={classes.githubIcon} icon={faGithub} />
        <span>{formattedName}</span>
      </TableHeader>
      <TableBody> */}
      {/* {!isLarge ? (
          <TableColumn>
          {statsItems.map(({ name, icon, value }) => (
            <Stats
            key={`github-stats-${name}`}
            height={statsHeight}
            name={name}
            icon={icon}
            value={value}
            />
            ))}
            </TableColumn>
            ) : (
              <Grid item container>
              <TableColumn xs={6} leftColumn>
              {statsItems.map(({ name, icon, value }) => (
                <Stats
                key={`github-stats-${name}`}
                height={statsHeight}
                name={name}
                icon={icon}
                value={value}
                />
                ))}
                </TableColumn>
                <TableColumn xs={6} rightColumn>
                {extraStatsItems.map(({ name, icon, value }) => (
                  <Stats
                  key={`github-stats-${name}`}
                  height={statsHeight}
                  name={name}
                  icon={icon}
                  value={value}
                  />
                  ))}
                  </TableColumn>
                  </Grid>
                )} */}
      {/* </TableBody>
    </Table> */}
    </>
  );
};

// Repository.propTypes = {
//   classes: PropTypes.object.isRequired,
//   width: PropTypes.string.isRequired,
//   repository: PropTypes.object.isRequired
// };

// Repository.defaultProps = {
//   rightAlign: false
// };

// export default withWidth()(withStyles(styles)(Repository));

export default Repository;
