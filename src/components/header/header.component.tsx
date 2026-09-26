import Clock from "./clock/clock.component";
import webkomLogo from "/webkom.png";
import styles from "./header.module.css";
import { PropsWithChildren } from "react";
import Github from "./github/github.component";

const Header = () => {
  const HeaderCell: React.FC<PropsWithChildren<{ className?: string }>> = ({
    children,
    className,
  }) => <span className={className}>{children}</span>;

  return (
    <div className={`flex flex-row`}>
      <HeaderCell className="g-flex-col">
        <div className="flex flex-row items-center">
          <img alt="Abakus Linjeforening" className={"w-15"} src={webkomLogo} />
          <h1 className={styles["title"]}>Webkom</h1>
        </div>
        <Clock />
      </HeaderCell>

      <HeaderCell>
        <Github />
      </HeaderCell>
    </div>
  );
};

export default Header;
