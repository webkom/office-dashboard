import React from 'react';
import DashboardListItem from './DashboardListItem';

const DashboardListHeader = () => {
  return (
    <DashboardListItem
      header={['Github', 'Kaffe', 'Brus', 'Kontortid', 'Sist sett']}
    />
  );
};

export default DashboardListHeader;
