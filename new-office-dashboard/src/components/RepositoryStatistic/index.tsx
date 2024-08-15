import "./index.css";
import type { Icon } from "@primer/octicons-react";

type Props = {
  height: number;
  name: string;
  Icon: Icon;
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
