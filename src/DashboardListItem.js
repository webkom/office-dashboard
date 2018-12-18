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
  compactGrid: {
    lineHeight: '1.5em',
    fontSize: '0.55rem'
  },
  compactListItem: {
    padding: 2,
    paddingTop: '0.5em',
    paddingBottom: '0.5em'
  },
    compactCoffee: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
  compactLastSeen: {
    paddingTop: '1em',
    lineHeight: '0.3em'
  },
  compactMetadata: {
    display: 'flex',
    justifyItems: 'flex-end'
  },
  compactAvatar: {
    display: 'flex',
    alignItems: 'center'
  },
  compactName: {
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#fff',
    opacity: 0.7,
    fontSize: '0.6rem',
    fontWeight: 'bold'
  },
  gridItem: {
    display: 'flex',
    alignItems: 'center',
    padding: 0
  },
  dataItem: {
    fontSize: '1rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.85rem'
    }
  },
  headerItem: {
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: '#fff',
    opacity: 0.7,
    fontWeight: 500,
    fontSize: '0.75rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.60rem'
    }
  },
  listItem: {
    padding: 20
  },
  alignRight: {
    justifyContent: 'flex-end'
  },
  alignCenter: {
    justifyContent: 'center'
  }
});

const DashboardListItem = props => {
  const { classes, children, avatar, width, header } = props;

  const gridItemClass = header ? classes.headerItem : classes.dataItem;

  return (
    <ListItem
      divider
      className={width === 'xs' ? classes.compactListItem : classes.listItem}
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
                      <Grid container>
                        <Grid item xs={9} className={classes.compactGithub}>
                          {children[1] /* Github */}
                        </Grid>
                        <Grid item xs={3} className={classes.compactCoffee}>
                          {children[2] /* Antall kaffekanner */}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item className={classes.compactOfficeTime}>
                  {children[3] /* Kontortid i dag */}
                </Grid>
                <Grid item className={classes.compactLastSeen}>
                  {children[4] /* Sist sett */}
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
              className={classNames(classes.gridItem, gridItemClass)}
            >
              {!header && children[0] /* Name */}
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
              xs={3}
              className={classNames(
                classes.gridItem,
                gridItemClass,
                classes.alignCenter
              )}
            >
              {!header ? children[2] : header[1] /* Antall kanner */}
            </Grid>

            <Grid
              item
              xs={3}
              className={classNames(
                classes.gridItem,
                gridItemClass,
                classes.alignRight
              )}
            >
              {!header ? children[3] : header[2] /* Kontortid i dag */}
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
              {!header ? children[4] : header[3] /* Sist sett */}
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
  ]).isRequired,
  width: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  header: PropTypes.array
};

export default withWidth()(withStyles(styles)(DashboardListItem));
