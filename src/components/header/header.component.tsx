import Clock from "./clock/clock.component";
import webkomLogo from "/webkom.png";
import styles from "./header.module.css";
import { PropsWithChildren } from "react";
import Github from "./github/github.component";

const Header = () => {

  const HeaderCell: React.FC<PropsWithChildren<{ className?: string }>> = ({
    children,
    className,
  }) => (
    <span
      className={`g-flex-row g-flex-justify-center g-flex-align-center g-height-full ${className ?? ""}`}
    >
      {children}
    </span>
  );

  return (
    <div className={`${styles["header"]} g-flex-row`}>
      <div className="g-not-mobile g-flex g-flex-row g-flex-justify-evenly g-flex-align-center g-p-2">
        <div
          className={`${styles["logo-and-clock"]} g-flex g-flex-row g-flex-justify-start g-flex-align-center`}
        >
          <HeaderCell className="g-flex-col">
            <div className="g-flex-row g-flex-align-center">
              <img
                alt="Abakus Linjeforening"
                className={styles["logo"]}
                src={webkomLogo}
              />
              <h1 className={styles["title"]}>
                Webkom
              </h1>
            </div>
            <Clock />
          </HeaderCell>
        </div>
        <HeaderCell>
          <Github />
        </HeaderCell>
      </div>
    </div>
  );
};

export default Header;
