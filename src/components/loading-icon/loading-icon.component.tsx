import webkomIcon from "/webkom.png";
import styles from "./loading-icon.module.css";

const LoadingIcon = () => (
  <img
    alt="Loading"
    className={styles["loading-icon"]}
    src={webkomIcon}
  />
);

export default LoadingIcon;
