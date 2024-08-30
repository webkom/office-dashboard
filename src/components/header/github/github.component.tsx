import Repository from "app/components/repository/repository.component";
import styles from "./github.module.css";
import { useDashboardData } from "app/hooks/dashboard-data.hook";

const Github = () => {
  const { data, isLoading } = useDashboardData();

  if (isLoading) return <></>;

  return (
    <div className={`${styles["github-repos"]} g-flex-row g-height-full`}>
      {!!data && (
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
      )}
    </div>
  );
};

export default Github;
