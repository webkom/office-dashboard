import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import * as moment from 'moment';
import 'moment-with-locales-es6';
import 'moment/locale/nb';
import 'moment-duration-format';

const styles = theme => ({
  cell: {
    padding: 10,
    textAlign: 'center'
  },
  leftAlign: {
    textAlign: 'left'
  },
  rightAlign: {
    textAlign: 'right'
  },
  avatar: {
    //width: 20
  },
  coffeeIcon: {
    color: theme.palette.secondary.main
  },
  githubIcon: {
    color: theme.palette.secondary.light
  }
});

const MemberRow = props => {
  const { classes, member } = props;

  return (
    <TableRow>
      <TableCell className={classes.cell} width="5%">
        <Avatar className={classes.avatar} src={member.avatar} />
      </TableCell>
      <TableCell
        className={classNames(classes.cell, classes.leftAlign)}
        width="15%"
      >
        {member.name}
      </TableCell>
      <TableCell
        className={classNames(classes.cell, classes.leftAlign)}
        width="20%"
      >
        <span>
          <FontAwesomeIcon className={classes.githubIcon} icon={faGithub} />
          <span> </span>
          <a href={`https://github.com/${member.github}`}>@{member.github}</a>
        </span>
      </TableCell>
      <TableCell
        className={classNames(classes.cell, classes.leftAlign)}
        width="25%"
      >
        Brygget ?{' '}
        <FontAwesomeIcon className={classes.coffeeIcon} icon={faCoffee} />{' '}
        kanne(r)
      </TableCell>
      <TableCell
        className={classNames(classes.cell, classes.rightAlign)}
        width="20%"
      >
        {member.activity_today === 0 ? (
          <span>-</span>
        ) : (
          <span>
            {moment
              .duration(member.activity_today, 'seconds')
              .format('h [timer] m [minutter]', {
                usePlural: false
              })}
          </span>
        )}
      </TableCell>
      <TableCell
        className={classNames(classes.cell, classes.rightAlign)}
        width="15%"
      >
        {member.is_active ? (
          <span>
            <b>På kontoret!</b>
          </span>
        ) : member.last_seen != null ? (
          <span>
            {moment(member.last_seen)
              .locale(moment.locale('nb'))
              .fromNow()}
          </span>
        ) : (
          <span>Ukjent</span>
        )}
      </TableCell>
    </TableRow>
  );
};

MemberRow.propTypes = {
  classes: PropTypes.object.isRequired,
  member: PropTypes.object.isRequired
};

export default withStyles(styles)(MemberRow);
