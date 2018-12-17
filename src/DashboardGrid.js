import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBeer } from '@fortawesome/free-solid-svg-icons';
import ErrorBoundary from './ErrorBoundary';
import DashboardHeader from './DashboardHeader';
import DashboardContent from './DashboardContent';
import DashboardSnackbar, { notify } from './DashboardSnackbar';

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  grid: {
    marginTop: 80,
    marginBottom: 80 - 30 - 18.75 // - padding for footer - line height
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    background: theme.palette.primary.light,
    color: theme.palette.text.secondary
  },
  beerIcon: {
    color: theme.palette.secondary.dark
  },
  madeByLove: {
    textAlign: 'center',
    color: theme.palette.primary.light,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 0,
    marginTop: 30
  }
});

export class DashboardGrid extends Component {
  handleError(errorMessage) {
    notify(errorMessage, 'error');
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Grid
          container
          justify="center"
          alignItems="center"
          className={classes.grid}
        >
          <Grid item xs={11}>
            <DashboardHeader />
            <Paper className={classes.paper} square>
              <ErrorBoundary onError={this.handleError}>
                <DashboardContent onError={this.handleError} />
                <DashboardSnackbar />
              </ErrorBoundary>
            </Paper>
            <p className={classes.madeByLove}>
              laget med{' '}
              <FontAwesomeIcon className={classes.beerIcon} icon={faBeer} /> av{' '}
              <a href="https://github.com/webkom">webkom</a>
            </p>
          </Grid>
        </Grid>
      </div>
    );
  }
}

DashboardGrid.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(DashboardGrid);
