import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, withTheme } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import darkLogo from 'app/static/abakus_logo_white_webkom.png';
//import darkLogoChristmas from 'app/static/abakus_logo_white_webkom_christmas.png';
import Environment from 'app/components/Environment';
import MediaInfo from 'app/components/MediaInfo';
import Github from 'app/components/Github';
import Clock from 'app/components/Clock';
import StatusBar from 'app/components/StatusBar';

const styles = theme => ({
  toolbar: {
    flex: '1 1 auto',
    textAlign: 'center',
    padding: 20,
    fontSize: '1rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.9rem'
    }
  },
  logo: {
    height: '50px'
  },
  clock: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rightContainer: {
    overflow: 'hidden'
  }
});

const Header = ({ classes, width, theme }) => {
  const isMobile = width !== undefined && width === 'xs';
  const isLarge = width !== undefined && ['lg', 'xl'].includes(width);

  return (
    <div>
      <AppBar position="static">
        {isMobile ? (
          <Grid container spacing={0} className={classes.toolbar}>
            <Grid item xs={12}>
              <img
                alt="Abakus Linjeforening"
                className={classes.logo}
                src={darkLogo}
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container justify={'flex-start'} className={classes.toolbar}>
            <Grid
              item
              container
              xs={isLarge ? 2 : 4}
              justify={'center'}
              alignItems={'center'}
            >
              <img
                alt="Abakus Linjeforening"
                className={classes.logo}
                src={darkLogo}
              />
            </Grid>
            <Grid item container xs={isLarge ? 1 : 2} alignItems={'center'}>
              <Clock />
            </Grid>
            <Grid
              item
              container
              xs={isLarge ? 9 : 6}
              alignItems={'center'}
              justify={'flex-end'}
              className={classes.rightContainer}
            >
              <Grid item container xs={isLarge ? 8 : 8} alignItems={'center'}>
                <Github />
              </Grid>
              <Grid item container xs={isLarge ? 2 : 4} alignItems={'center'}>
                <Environment />
              </Grid>
            </Grid>
          </Grid>
        )}
      </AppBar>
      <MediaInfo />
      <StatusBar />
    </div>
  );
};

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired
};

export default withWidth()(withTheme()(withStyles(styles)(Header)));
