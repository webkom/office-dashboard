import React from "react";
import { Icon } from "@primer/octicons-react";
import "./index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = (theme) => ({
  container: {
    width: "100%",
    height: "var(--value-container-height)",
    fontSize: "0.85rem",
  },
  containerLeft: {
    width: "60%",
    textAlign: "left",
  },
  containerRight: {
    width: "40%",
    textAlign: "right",
  },
  iconContainer: {
    width: "20%",
    marginBottom: "-2px",
    textAlign: "center",
  },
  icon: {
    color: theme.palette.secondary.main,
    opacity: 0.8,
  },
  text: {
    width: "80%",
    opacity: 0.7,
    textAlign: "left",
  },
  value: {
    fontFamily: "monospace",
    opacity: 0.7,
  },
});

type Props = {
  height: number;
  name: string;
  Icon: Icon | typeof FontAwesomeIcon;
  value: string | number;
};

const RepositoryStatistic = ({ height, name, Icon, value }: Props) => (
  <div
    className="stats g-flex-row g-flex-align-center"
    style={{ height: `${height}%` }}
  >
    <Icon className="icon" />
    <div className="text-and-value g-flex-row">
      <div className="text g-flex">{name !== null ? `${name}:` : "==>"}</div>
      <div className="value">{value}</div>
    </div>
  </div>
);

export default RepositoryStatistic;
