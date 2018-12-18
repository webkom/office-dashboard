import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import Grid from '@material-ui/core/Grid';
import DashboardListItem from './DashboardListItem';

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  isActive: {
    fontWeight: 'bold'
  },
  prefix: {
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#fff',
    fontWeight: 'bold'
  },
  coffeeIcon: {
    color: theme.palette.secondary.main
  },
  githubIcon: {
    color: theme.palette.secondary.light
  },
  alignRight: {
    textAlign: 'right'
  }
});

const DashboardListMember = props => {
  const {
    classes,
    width,
    avatar,
    name,
    github,
    coffeeCount,
    activityToday,
    lastSeen
  } = props;
  const isActive = lastSeen === 'På kontoret!';
  return (
    <DashboardListItem avatar={avatar} isActive={isActive}>
      <span>{name}</span>
      <span>
        <FontAwesomeIcon className={classes.githubIcon} icon={faGithub} />
        <span> </span>
        <a href={`https://github.com/${github}`}>@{github}</a>
      </span>
      {width === 'xs' ? (
        <span className={classes.compactCenter}>
          ? <FontAwesomeIcon className={classes.coffeeIcon} icon={faCoffee} />
        </span>
      ) : (
        <span>
          Brygget {coffeeCount}{' '}
          <FontAwesomeIcon className={classes.coffeeIcon} icon={faCoffee} />{' '}
          kanne(r)
        </span>
      )}
      {width === 'xs' ? (
        <Grid container>
          <Grid item xs={5} className={classes.prefix}>
            Kontortid:
          </Grid>
          <Grid item xs={7} className={classes.alignRight}>
            {activityToday}
          </Grid>
        </Grid>
      ) : (
        <span>{activityToday}</span>
      )}
      {width === 'xs' ? (
        <Grid container>
          <Grid item xs={5} className={classes.prefix}>
            Sist sett:
          </Grid>
          <Grid
            item
            xs={7}
            className={classNames(
              classes.alignRight,
              isActive && classes.isActive
            )}
          >
            {lastSeen}
          </Grid>
        </Grid>
      ) : (
        <span className={isActive && classes.isActive}>{lastSeen}</span>
      )}
    </DashboardListItem>
  );
};

DashboardListMember.propTypes = {
  classes: PropTypes.object.isRequired,
  avatar: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  github: PropTypes.string.isRequired,
  coffeeCount: PropTypes.string.isRequired,
  activityToday: PropTypes.string.isRequired,
  lastSeen: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired
};

export default withWidth()(withStyles(styles)(DashboardListMember));
