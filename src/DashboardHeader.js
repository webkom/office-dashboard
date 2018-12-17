import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
// import lightLogo from './static/abakus_logo_black.png';
import darkLogo from './static/abakus_logo_white.png';

const styles = {
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1
  },
  toolbar: {
    justifyContent: 'center',
    flex: '1 1 auto',
    textAlign: 'center',
    padding: 20
  },
  logo: {
    height: '50px'
  },
  webkom: {
    height: '60px'
  }
};

const DashboardHeader = props => {
  const { classes } = props;

  return (
    <AppBar position="static">
      <Toolbar className={classes.toolbar}>
        <img
          alt="Abakus Linjeforening"
          className={classes.logo}
          src={darkLogo}
        />
      </Toolbar>
    </AppBar>
  );
};

DashboardHeader.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(DashboardHeader);
