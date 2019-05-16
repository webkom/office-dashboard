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
import ListItem from 'app/components/List/Item';
import Stats from 'app/components/Member/Stats';
import getPlural from 'app/utils';

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
  frownIcon: {
    fontSize: 'inherit',
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.5rem'
    }
  },
  firstSeen: {
    fontSize: '0.6rem',
    opacity: 0.7
  },
  firstSeenCompact: {
    paddingBottom: '0.25rem'
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

const Item = props => {
  const {
    classes,
    width,
    avatar,
    name,
    github,
    brusData,
    kaffeData,
    activityToday,
    firstSeen,
    lastSeen
  } = props;
  const isActive = lastSeen === 'På kontoret!';
  const formattedActivityToday =
    activityToday === '' ? (
      <FontAwesomeIcon
        className={classNames(classes.statsIcon, classes.frownIcon)}
        icon={faFrown}
      />
    ) : (
      activityToday
    );
  const formattedFirstSeen =
    firstSeen === null ? 'Ukjent' : firstSeen.format('HH:mm:ss');
  return (
    <ListItem avatar={avatar} isActive={isActive}>
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
          <Stats icon={faCoffee} value={kaffeData.jugs_brewed} compact />
          <Stats
            icon={faFlask}
            value={`${kaffeData.volume_brewed} L`}
            compact
          />
          <Stats icon={faDollarSign} value={`${brusData.balance} kr`} compact />
          <Stats
            icon={faGlassWhiskey}
            value={brusData.soda_cans_bought}
            compact
          />
          <Stats
            icon={faWineBottle}
            value={brusData.soda_bottles_bought}
            compact
          />
        </Grid>
      )}
      {width !== 'xs' && (
        <Grid container direction={'column'} className={classes.alignCenter}>
          <Stats
            icon={faCoffee}
            value={`${kaffeData.jugs_brewed}`}
            text={getPlural('kanne', 'r', kaffeData.jugs_brewed)}
          />
          <Stats icon={faFlask} value={kaffeData.volume_brewed} text="liter" />
        </Grid>
      )}
      {width !== 'xs' && (
        <Grid
          container
          direction={'column'}
          className={classes.alignCenter}
          title={`Saldo: ${brusData.balance} kr`}
        >
          <Stats
            icon={faGlassWhiskey}
            value={brusData.soda_cans_bought}
            text={getPlural('boks', 'er', brusData.soda_cans_bought)}
          />
          <Stats
            icon={faWineBottle}
            value={brusData.soda_bottles_bought}
            text={getPlural('flaske', 'r', brusData.soda_bottles_bought)}
          />
        </Grid>
      )}
      {width === 'xs' ? (
        <div>
          <Grid container className={classes.firstSeenCompact}>
            <Grid item xs={5} className={classes.prefix}>
              Først sett:
            </Grid>
            <Grid item xs={7} className={classes.alignRight}>
              {formattedFirstSeen}
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={5} className={classes.prefix}>
              Kontortid:
            </Grid>
            <Grid item xs={7} className={classes.alignRight}>
              {formattedActivityToday}
            </Grid>
          </Grid>
        </div>
      ) : (
        <div className={classes.alignRight}>
          {firstSeen !== null && (
            <div className={classes.firstSeen}>
              Først sett: {formattedFirstSeen}
            </div>
          )}
          <div>{formattedActivityToday}</div>
        </div>
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
    </ListItem>
  );
};

Item.propTypes = {
  classes: PropTypes.object.isRequired,
  avatar: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  github: PropTypes.string.isRequired,
  brusData: PropTypes.object.isRequired,
  kaffeData: PropTypes.object.isRequired,
  activityToday: PropTypes.string.isRequired,
  lastSeen: PropTypes.string.isRequired,
  firstSeen: PropTypes.object,
  width: PropTypes.string.isRequired
};

export default withWidth()(withStyles(styles)(Item));
