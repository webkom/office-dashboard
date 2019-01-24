import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { faFlask } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { faGlassWhiskey } from '@fortawesome/free-solid-svg-icons';
import { faWineBottle } from '@fortawesome/free-solid-svg-icons';
import Grid from '@material-ui/core/Grid';
import DashboardListItem from './DashboardListItem';
import StatsItem from './StatsItem';

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
  statsIcon: {
    color: theme.palette.secondary.dark
  },
  alignCenter: {
    textAlign: 'center'
  },
  alignLeft: {
    textAlign: 'left'
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
    brusData,
    kaffeData,
    activityToday,
    lastSeen
  } = props;
  const isActive = lastSeen === 'På kontoret!';
  const formattedActivityToday =
    activityToday === '' ? (
      <FontAwesomeIcon className={classes.statsIcon} icon={faFrown} />
    ) : (
      activityToday
    );
  return (
    <DashboardListItem avatar={avatar} isActive={isActive}>
      <span>{name}</span>
      <span>
        <FontAwesomeIcon className={classes.statsIcon} icon={faGithub} />
        <span> </span>
        <a href={`https://github.com/${github}`}>@{github}</a>
      </span>
      {width === 'xs' && (
        <Grid
          container
          justify={'space-around'}
          className={classes.alignCenter}
        >
          <StatsItem icon={faCoffee} value={kaffeData.jugs_brewed} compact />
          <StatsItem
            icon={faFlask}
            value={`${kaffeData.volume_brewed} L`}
            compact
          />
          <StatsItem
            icon={faDollarSign}
            value={`${brusData.balance} kr`}
            compact
          />
          <StatsItem
            icon={faGlassWhiskey}
            value={brusData.soda_cans_bought}
            compact
          />
          <StatsItem
            icon={faWineBottle}
            value={brusData.soda_bottles_bought}
            compact
          />
        </Grid>
      )}
      {width !== 'xs' && (
        <Grid container direction={'column'} className={classes.alignCenter}>
          <StatsItem
            icon={faCoffee}
            value={`${kaffeData.jugs_brewed}`}
            text="kanner"
          />
          <StatsItem
            icon={faFlask}
            value={kaffeData.volume_brewed}
            text="liter"
          />
        </Grid>
      )}
      {width !== 'xs' && (
        <Grid container direction={'column'} className={classes.alignCenter}>
          <StatsItem
            icon={faGlassWhiskey}
            value={brusData.soda_cans_bought}
            text="bokser"
          />
          <StatsItem
            icon={faWineBottle}
            value={brusData.soda_bottles_bought}
            text="flasker"
          />
        </Grid>
      )}
      {width === 'xs' ? (
        <Grid container>
          <Grid item xs={5} className={classes.prefix}>
            Kontortid:
          </Grid>
          <Grid item xs={7} className={classes.alignRight}>
            {formattedActivityToday}
          </Grid>
        </Grid>
      ) : (
        <span>{formattedActivityToday}</span>
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
        <span className={isActive ? classes.isActive : ''}>{lastSeen}</span>
      )}
    </DashboardListItem>
  );
};

DashboardListMember.propTypes = {
  classes: PropTypes.object.isRequired,
  avatar: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  github: PropTypes.string.isRequired,
  brusData: PropTypes.object.isRequired,
  kaffeData: PropTypes.object.isRequired,
  activityToday: PropTypes.string.isRequired,
  lastSeen: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired
};

export default withWidth()(withStyles(styles)(DashboardListMember));
