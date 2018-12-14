import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles  } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const styles = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

const DashboardHeader = (props) => {
  const { classes, title } = props;

  return (
    <AppBar position="static">
	<Toolbar>
	  <Typography variant="h6" color="inherit" className={classes.grow}>
          {title}
	  </Typography>
	</Toolbar>
    </AppBar>
  );
}


DashboardHeader.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withStyles(styles)(DashboardHeader);
