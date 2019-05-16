import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles, withTheme } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
// import lightLogo from 'app/static/abakus_logo_black_webkom.png';
import darkLogo from 'app/static/abakus_logo_white_webkom.png';
import Environment from 'app/components/Environment';
import MediaInfo from 'app/components/MediaInfo';
import Github from 'app/components/Github';
import Clock from 'app/components/Clock';

const styles = theme => ({
  toolbar: {
    justifyContent: 'center',
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
          <Grid container className={classes.toolbar}>
            <Grid item container xs={isLarge ? 5 : 4} alignItems={'center'}>
              <Github />
            </Grid>
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
            <Grid item container xs={isLarge ? 5 : 4} alignItems={'center'}>
              <Grid item container xs={8} className={classNames(classes.clock)}>
                <Clock />
              </Grid>
              <Grid item container xs={4} alignItems="center">
                <Environment />
              </Grid>
            </Grid>
          </Grid>
        )}
      </AppBar>
      <MediaInfo />
    </div>
  );
};

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  officeChromecastFetch: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired
};

export default withWidth()(withTheme()(withStyles(styles)(Header)));
