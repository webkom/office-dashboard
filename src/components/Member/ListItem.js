import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBlind,
  faCoffee,
  faQuestion,
  faFlask,
  faFrown,
  faDollarSign,
  faBeer,
  faWineBottle
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import Grid from '@material-ui/core/Grid';
import ListItem from 'app/components/List/Item';
import Stats from 'app/components/Member/Stats';
import getPlural from 'app/utils';
import { GITHUB_URL } from 'app/config';
import moment from 'moment';

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
  smallGithubContributions: {
    fontSize: '0.4rem'
  },
  smallGithubRepo: {
    padding: '2px'
  },
  githubContainer: {
    width: '60%',
    [theme.breakpoints.down('lg')]: {
      width: '80%'
    },
    [theme.breakpoints.down('md')]: {
      width: '60%'
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  githubRepoName: {
    color: 'white',
    fontWeight: 'bold'
  },
  githubContributions: {
    opacity: 0.6,
    fontSize: '0.8rem',
    [theme.breakpoints.down('lg')]: {
      fontSize: '0.65rem'
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '0.5rem'
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.5rem'
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

const isSameDayAndMonth = (m1, m2) =>
  m1.date() === m2.date() && m1.month() === m2.month();

const getTranslatedProductType = product_type => {
  switch (product_type) {
    case 'beer':
      return 'Øl';
    case 'soda':
      return 'Brus';
    default:
      return 'Ukjent';
  }
};

const getProductTypeIcon = product_type => {
  switch (product_type) {
    case 'beer':
      return faBeer;
    case 'soda':
      return faWineBottle;
    default:
      return faQuestion;
  }
};

const Item = props => {
  const {
    classes,
    width,
    avatar,
    name,
    github,
    githubContributions,
    brusData,
    kaffeData,
    birthday,
    firstLegoCommit,
    activityToday,
    firstSeen,
    lastSeen,
    isPang
  } = props;
  const isActive = lastSeen === 'På kontoret!';
  const isBirthday =
    birthday !== null ? isSameDayAndMonth(moment(), birthday) : false;
  const isLegoDay =
    firstLegoCommit !== null
      ? isSameDayAndMonth(moment(), firstLegoCommit)
      : false;
  const formattedActivityToday =
    activityToday === '' ? (
      !isPang ? (
        <FontAwesomeIcon
          className={classNames(classes.statsIcon, classes.frownIcon)}
          icon={faFrown}
        />
      ) : (
        <>
          {[1, 2, 3, 4].map(i => (
            <FontAwesomeIcon
              key={`blind-icon-${i}`}
              className={classNames(classes.statsIcon, classes.frownIcon)}
              icon={faBlind}
            />
          ))}
        </>
      )
    ) : (
      activityToday
    );
  const formattedFirstSeen =
    firstSeen === null ? 'Ukjent' : firstSeen.format('HH:mm:ss');
  return (
    <ListItem
      avatar={avatar}
      isActive={isActive}
      isPang={isPang}
      isBirthday={isBirthday}
      isLegoDay={isLegoDay}
    >
      <span>{name}</span>
      <div className={classes.githubContainer}>
        <FontAwesomeIcon className={classes.statsIcon} icon={faGithub} />
        <span> </span>
        <a href={`${GITHUB_URL}/${github}`}>@{github}</a>
        {width !== 'xs' && (
          <Grid
            container
            direction={'row'}
            justify={'space-between'}
            className={classes.githubContributions}
          >
            {githubContributions.map(item => (
              <div key={`contributions-${github}-${item.repository}`}>
                <a
                  href={`${GITHUB_URL}/${item.repository}`}
                  className={classes.githubRepoName}
                >
                  {item.repository.replace('webkom/', '')}:
                </a>{' '}
                {item.contributions}
              </div>
            ))}
          </Grid>
        )}
      </div>
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
          {brusData.purchase_summary === '?'
            ? '?'
            : Object.keys(brusData.purchase_summary).map(product_type => (
                <Stats
                  key={product_type}
                  icon={getProductTypeIcon(product_type)}
                  value={brusData.purchase_summary[product_type]}
                  compact
                />
              ))}
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
          {brusData.purchase_summary === '?'
            ? '?'
            : Object.keys(brusData.purchase_summary).map(product_type => (
                <Stats
                  key={product_type}
                  icon={getProductTypeIcon(product_type)}
                  value={brusData.purchase_summary[product_type]}
                  text={getTranslatedProductType(product_type)}
                />
              ))}
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
  width: PropTypes.string.isRequired,
  avatar: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  github: PropTypes.string.isRequired,
  brusData: PropTypes.object.isRequired,
  kaffeData: PropTypes.object.isRequired,
  activityToday: PropTypes.string.isRequired,
  lastSeen: PropTypes.string.isRequired,
  githubContributions: PropTypes.object,
  firstSeen: PropTypes.object,
  birthday: PropTypes.object,
  firstLegoCommit: PropTypes.object,
  isPang: PropTypes.bool
};

export default withWidth()(withStyles(styles)(Item));
