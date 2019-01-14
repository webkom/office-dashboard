import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

const styles = theme => ({
  root: {
    flexGrow: 1
  },
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
    textAlign: 'right'
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
  }
});

const DashboardListItem = props => {
  const { classes, children, isActive, avatar, width, header } = props;

  const gridItemClass = header ? classes.headerItem : classes.dataItem;

  return (
    <ListItem
      divider
      className={classNames(
        isActive && classes.isActive,
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
                  <Grid container justify={'space-around'}>
                    <Grid item xs={6} className={classes.compactCoffee}>
                      {children[2] /* Kaffe */}
                    </Grid>
                    <Grid item xs={6} className={classes.compactBrus}>
                      {children[3] /* Brus */}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item className={classes.compactOfficeTime}>
                  {children[4] /* Kontortid */}
                </Grid>
                <Grid item className={classes.compactLastSeen}>
                  {children[5] /* Sist sett */}
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
              xs={2}
              className={classNames(classes.gridItem, gridItemClass)}
            >
              {!header ? children[1] : header[0] /* Github */}
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
              {!header ? children[2] : header[1] /* Kaffe */}
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
              {!header ? children[3] : header[2] /* Brus */}
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
              {!header ? children[4] : header[3] /* Kontortid */}
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
              {!header ? children[5] : header[4] /* Sist sett */}
            </Grid>
          </Grid>
        )}
      </ListItemText>
    </ListItem>
  );
};

DashboardListItem.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  width: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  isActive: PropTypes.bool,
  header: PropTypes.array
};

export default withWidth()(withStyles(styles)(DashboardListItem));
