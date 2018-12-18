import React from 'react';
import PropTypes from 'prop-types';
import * as moment from 'moment';
import 'moment-with-locales-es6';
import 'moment/locale/nb';
import 'moment-duration-format';
import DashboardListMember from './DashboardListMember';

const MemberItem = props => {
  const { member } = props;

  return (
    <DashboardListMember
      avatar={member.avatar}
      name={member.name}
      github={member.github}
      coffeeCount={'?'} // TODO: implement kaffe_listener
      activityToday={
        member.activity_today === 0
          ? '-'
          : moment
              .duration(member.activity_today, 'seconds')
              .format('h [timer] m [minutter]', {
                usePlural: false
              })
      }
      lastSeen={
        member.is_active
          ? 'På kontoret!'
          : member.last_seen != null
          ? moment(member.last_seen)
              .locale(moment.locale('nb'))
              .fromNow()
          : 'Ukjent'
      }
    />
  );
};

MemberItem.propTypes = {
  member: PropTypes.object.isRequired
};

export default MemberItem;
