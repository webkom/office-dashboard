import Repository from "app/components/repository/repository.component";
import styles from "./github.module.css";
import { useDashboardData } from "app/hooks/dashboard-data.hook";
import NoData from "app/components/nodata/nodata.component";
import { IsEmpty } from "app/helpers/is-empty";

const Github = () => {
  const { data, isLoading } = useDashboardData();

  if (isLoading || !data) return <></>;

  const { repository_stats } = data;
  return (
    <div className={`${styles["github-repos"]} g-flex-row g-height-full`}>
      {!IsEmpty(repository_stats) ? (
        <>
          <Repository
            key={"repository-lego"}
            repository={data.repository_stats["lego"]}
          />
          <Repository
            key={"repository-webapp"}
            repository={data.repository_stats["webapp"]}
          />
        </>
      ) : (
        <NoData cause="Missing field `repository_stats` from backend" />
      )}
    </div>
  );
};

export default Github;
