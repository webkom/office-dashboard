import React from 'react';
import PropTypes from 'prop-types';
import 'moment/locale/nb';
import 'moment-duration-format';
import * as moment from 'moment';
import ListItem from 'app/components/Member/ListItem';

const getTimeFormatString = value => {
  value = Number(value);
  const hour = Math.floor(value / 3600) > 1 ? 'timer' : 'time';
  const minute = Math.floor((value % 3600) / 60) > 1 ? 'minutter' : 'minutt';
  return `h [${hour}] m [${minute}]`;
};

const Member = props => {
  const { member } = props;

  return (
    <ListItem
      avatar={member.avatar}
      name={member.name}
      github={member.github}
      githubContributions={member.github_contributions}
      brusData={member.brus_data}
      kaffeData={member.kaffe_data}
      birthday={
        member.birthday
          ? moment(member.birthday).locale(moment.locale('nb'))
          : null
      }
      joined={
        member.joined ? moment(member.joined).locale(moment.locale('nb')) : null
      }
      firstLegoCommit={
        member.first_lego_commit
          ? moment(member.first_lego_commit).locale(moment.locale('nb'))
          : null
      }
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
      isPang={member.is_pang}
    />
  );
};

Member.propTypes = {
  member: PropTypes.object.isRequired
};

export default Member;
