import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./nodata.module.css";
import React from "react";
import { faSurprise } from "@fortawesome/free-solid-svg-icons";

const NoData: React.FC<{ cause: string }> = (props) => {
  return (
    <div className={styles.nodata}>
      <FontAwesomeIcon
        className={styles["suprised-icon"]}
        size="lg"
        icon={faSurprise}
      />
      {props.cause}
    </div>
  );
};

export default NoData;
