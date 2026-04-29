import bytes from "bytes";
import {
  HistoryIcon,
  GitPullRequestIcon,
  StarIcon,
  GitMergeIcon,
  DatabaseIcon,
} from "@primer/octicons-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import styles from "./repository.module.css";
import RepositoryStatistic from "../repository-statistic/repository-statistic.component";
import React from "react";
import { RepositoryStats } from "app/hooks/dashboard-data.hook";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

const Repository: React.FC<{ repository: RepositoryStats }> = (props) => {
  const {
    repository: {
      name,
      commits,
      pull_requests_open,
      stars,
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
      name: "Stjerner",
      icon: StarIcon,
      value: Number(stars).toLocaleString("en"),
    },
  ];
  const extraStatsItems = [
    {
      name: "Flettede PRs",
      icon: GitMergeIcon,
      value: Number(pull_requests_merged).toLocaleString("en"),
    },
    {
      name: "Diskforbruk",
      icon: DatabaseIcon,
      value: bytes(disk_usage * 1024) || "",
    },
    {
      name: "Siste Dytt",
      icon: HistoryIcon,
      value: new Date(updated_at).toISOString().split("T")[0],
    },
  ];

  const maxItems = 3;
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
    </>
  );
};

export default Repository;
