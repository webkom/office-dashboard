import React from 'react';
import DashboardListItem from './DashboardListItem';

const DashboardListHeader = () => {
  return (
    <DashboardListItem
      header={['Github', 'Antall kanner', 'Kontortid i dag', 'Sist sett']}
    />
  );
};

export default DashboardListHeader;
