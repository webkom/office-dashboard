import Clock from "./clock/clock.component";
import darkLogo from "/abakus_logo_white_webkom.png";
import styles from "./header.module.css";
import { PropsWithChildren } from "react";
import Github from "./github/github.component";

const Header = () => {
  // const isMobile = width !== undefined && width === 'xs';
  // const isLarge = width !== undefined && ['lg', 'xl'].includes(width);

  const HeaderCell: React.FC<PropsWithChildren<{ className?: string }>> = ({
    children,
    className,
  }) => (
    <span
      className={`${className ?? ""} g-flex-row g-flex-justify-center g-flex-align-center g-height-full`}
    >
      {children}
    </span>
  );

  return (
    <div className={`${styles["header"]} g-flex-row`}>
      <div className="g-mobile g-flex g-flex-row g-flex-justify-center g-flex-align-center g-p-2">
        <HeaderCell className="g-flex">
          <img
            alt="Abakus Linjeforening"
            className={styles["logo"]}
            src={darkLogo}
          />
        </HeaderCell>
      </div>
      <div className="g-not-mobile g-flex g-flex-row g-flex-justify-evenly g-flex-align-center g-p-2">
        <div
          className={`${styles["logo-and-clock"]} g-flex g-flex-row g-flex-justify-start g-flex-align-center`}
        >
          <HeaderCell>
            <img
              alt="Abakus Linjeforening"
              className={styles["logo"]}
              src={darkLogo}
            />
          </HeaderCell>
          <HeaderCell>
            <Clock />
          </HeaderCell>
        </div>
        <HeaderCell>
          <Github />
        </HeaderCell>
        {/* <HeaderCell>
          <Sensors />
        </HeaderCell> */}
      </div>
    </div>
  );
};

export default Header;
