import React from 'react';
import PropTypes from 'prop-types';
import * as moment from 'moment';
import 'moment-with-locales-es6';
import 'moment/locale/nb';
import 'moment-duration-format';
import DashboardListMember from './DashboardListMember';

const getTimeFormatString = value => {
  value = Number(value);
  const hour = Math.floor(value / 3600) > 1 ? 'timer' : 'time';
  const minute = Math.floor((value % 3600) / 60) > 1 ? 'minutter' : 'minutt';
  return `h [${hour}] m [${minute}]`;
};

const MemberItem = props => {
  const { member } = props;

  return (
    <DashboardListMember
      avatar={member.avatar}
      name={member.name}
      github={member.github}
      brusData={member.brus_data}
      kaffeData={member.kaffe_data}
      activityToday={
        member.activity_today === 0
          ? ''
          : moment
              .duration(member.activity_today, 'seconds')
              .format(getTimeFormatString(member.activity_today), {
                usePlural: false
              })
      }
      firstSeen={
        member.first_seen
          ? moment(member.first_seen).locale(moment.locale('nb'))
          : null
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
