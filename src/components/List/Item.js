import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import LegoIcon from 'app/static/lego.png';

const styles = theme => ({
  isActive: {
    background: theme.palette.primary.main
  },
  compactGrid: {
    lineHeight: '1.5em',
    fontSize: '0.55rem',
    whiteSpace: 'nowrap'
  },
  compactListItem: {
    padding: 2,
    paddingTop: '0.5em',
    paddingBottom: '0.5em'
  },
  compactStats: {
    width: '100%',
    whiteSpace: 'nowrap'
  },
  compactStatsActive: {
    borderTop: `0.5px ${theme.palette.primary.light} solid`,
    borderBottom: `0.5px ${theme.palette.primary.light} solid`
  },
  compactStatsNotActive: {
    borderTop: `0.5px ${theme.palette.primary.main} solid`,
    borderBottom: `0.5px ${theme.palette.primary.main} solid`
  },
  compactCoffee: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  compactBrus: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  compactLastSeen: {
    paddingTop: '1em',
    lineHeight: '0.3em'
  },
  compactMetadata: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  compactAvatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  compactName: {
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#fff',
    opacity: 0.7,
    fontSize: '0.55rem',
    fontWeight: 'bold'
  },
  compactOfficeTime: {
    marginTop: 2
  },
  gridItem: {
    display: 'flex',
    alignItems: 'center',
    padding: 0
  },
  dataItem: {
    fontSize: '1rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.75rem'
    }
  },
  headerItem: {
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: '#fff',
    opacity: 0.7,
    fontWeight: 500,
    fontSize: '1.2rem',
    [theme.breakpoints.down('lg')]: {
      fontSize: '1.2rem'
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '1rem'
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.75rem'
    }
  },
  listItem: {
    padding: 10
  },
  memberName: {
    letterSpacing: 1
  },
  alignRight: {
    justifyContent: 'flex-end'
  },
  alignCenter: {
    justifyContent: 'center'
  },
  '@keyframes outline-pulsate': {
    '0%': { outlineColor: 'rgba(251, 5, 6, 1)' },
    '50%': { outlineColor: 'rgba(251, 5, 6, 0)' },
    '100%': { outlineColor: 'rgba(251, 5, 6, 1)' }
  },
  birthday: {
    zIndex: 1000,
    outlineWidth: '6px',
    outlineColor: theme.palette.secondary.main,
    outlineStyle: 'outset',
    animation: 'outline-pulsate 3s infinite'
  },
  '@keyframes text-pulsate': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0 },
    '100%': { opacity: 1 }
  },
  legoDay: {
    color: theme.palette.secondary.main,
    animation: 'text-pulsate 3s infinite'
  },
  legoIcon: {
    width: '16px',
    height: '16px',
    [theme.breakpoints.down('xs')]: {
      width: '8.8px',
      height: '8.8px'
    }
  }
});

const Item = props => {
  const {
    classes,
    children,
    isActive,
    isBirthday,
    isLegoDay,
    avatar,
    width,
    header
  } = props;

  const gridItemClass = header ? classes.headerItem : classes.dataItem;

  return (
    <ListItem
      divider
      className={classNames(
        isActive && classes.isActive,
        isBirthday && classes.birthday,
        width === 'xs' ? classes.compactListItem : classes.listItem
      )}
    >
      <ListItemText className={classes.root}>
        {width === 'xs' ? (
          <Grid container className={classes.compactGrid}>
            <Grid item xs={3} className={classes.compactAvatar}>
              {avatar && <Avatar className={classes.avatar} src={avatar} />}
            </Grid>

            <Grid item xs={9}>
              <Grid container direction="column">
                <Grid item>
                  <Grid container>
                    <Grid item xs={5} className={classes.compactName}>
                      {children[0] /* Name */}
                    </Grid>
                    <Grid item xs={7} className={classes.compactMetadata}>
                      {isLegoDay && (
                        <div
                          className={classes.legoDay}
                          style={{ paddingRight: '5px' }}
                        >
                          <img
                            src={LegoIcon}
                            className={classes.legoIcon}
                            style={{ paddingRight: '5px' }}
                            alt="LEGO day icon"
                          />
                          LEGO day!
                          <img
                            src={LegoIcon}
                            className={classes.legoIcon}
                            style={{ paddingLeft: '5px' }}
                            alt="LEGO day icon"
                          />
                        </div>
                      )}
                      {children[1] /* Github */}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  item
                  className={classNames(
                    classes.compactStats,
                    isActive
                      ? classes.compactStatsActive
                      : classes.compactStatsNotActive
                  )}
                >
                  <span>{children[2] /* Kaffe && Brus */}</span>
                </Grid>
                <Grid item className={classes.compactOfficeTime}>
                  {children[5] /* Kontortid */}
                </Grid>
                <Grid item className={classes.compactLastSeen}>
                  {children[6] /* Sist sett */}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <Grid container>
            <Grid
              item
              xs={1}
              className={classNames(classes.gridItem, gridItemClass)}
            >
              {avatar && <Avatar className={classes.avatar} src={avatar} />}
            </Grid>

            <Grid
              item
              xs={1}
              className={classNames(
                classes.gridItem,
                gridItemClass,
                classes.memberName
              )}
            >
              {!header && children[0] /* Navn */}
            </Grid>

            <Grid
              item
              container
              xs={2}
              className={classNames(classes.gridItem, gridItemClass)}
              direction={!header && isLegoDay ? 'column' : 'row'}
              style={{
                alignItems: !header && isLegoDay ? 'flex-start' : 'center'
              }}
            >
              {!header ? children[1] : header[0] /* Github */}
              {!header && isLegoDay && (
                <div className={classes.legoDay}>
                  <img
                    src={LegoIcon}
                    className={classes.legoIcon}
                    style={{ paddingRight: '5px' }}
                    alt="LEGO day icon"
                  />
                  LEGO day!
                  <img
                    src={LegoIcon}
                    className={classes.legoIcon}
                    style={{ paddingLeft: '5px' }}
                    alt="LEGO day icon"
                  />
                </div>
              )}
            </Grid>

            <Grid
              item
              xs={2}
              className={classNames(
                classes.gridItem,
                gridItemClass,
                classes.alignCenter
              )}
            >
              {!header ? children[3] : header[1] /* Kaffe */}
            </Grid>

            <Grid
              item
              xs={2}
              className={classNames(
                classes.gridItem,
                gridItemClass,
                classes.alignCenter
              )}
            >
              {!header ? children[4] : header[2] /* Brus */}
            </Grid>

            <Grid
              item
              xs={2}
              className={classNames(
                classes.gridItem,
                gridItemClass,
                classes.alignRight
              )}
            >
              {!header ? children[5] : header[3] /* Kontortid */}
            </Grid>

            <Grid
              item
              xs={2}
              className={classNames(
                classes.gridItem,
                gridItemClass,
                classes.alignRight
              )}
            >
              {!header ? children[6] : header[4] /* Sist sett */}
            </Grid>
          </Grid>
        )}
      </ListItemText>
    </ListItem>
  );
};

Item.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  width: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  isActive: PropTypes.bool,
  isBirthday: PropTypes.bool,
  isLegoDay: PropTypes.bool,
  header: PropTypes.array
};

export default withWidth()(withStyles(styles)(Item));
