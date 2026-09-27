import React from "react";
import Content from "app/components/dashboard/content/content.component";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

const Dashboard: React.FC = () => {
  return (
    <div className="bg-background dark">
      {/* <Header /> */}
      <Content />
      <p className="made-by-love g-text-center">
        laget med{" "}
        <FontAwesomeIcon className="beer-icon" icon={faCoffee as IconProp} /> av{" "}
        <a href="https://github.com/webkom/office-dashboard">webkom</a>
      </p>
    </div>
  );
};

export default Dashboard;
