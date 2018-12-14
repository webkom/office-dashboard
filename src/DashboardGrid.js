import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles  } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import DashboardHeader from './DashboardHeader';
import DashboardContent from './DashboardContent';
import './DashboardGrid.css';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
});

const DashboardGrid = (props) => {
  const { classes } = props;

  return (
    <div className={classes.root}>
      <Grid container justify="center" alignItems="center">
        <Grid item xs={10}>
          <DashboardHeader title="Abakus - Webkomkontor" />
          <Paper className={classes.paper}>
            <DashboardContent />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}


DashboardGrid.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withStyles(styles)(DashboardGrid);
