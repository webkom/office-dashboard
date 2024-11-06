import webkomIcon from "/webkom_kule.png";
import styles from "./loading-icon.module.css";

const LoadingIcon = () => (
  <img
    alt="Loading"
    className={styles["loading-icon"]}
    src={webkomIcon}
    //   style={{ height: `${size}vh`, width: `${size}vh` }}
  />
);

export default LoadingIcon;
