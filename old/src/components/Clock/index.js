import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';

const styles = theme => ({
  clockDay: {
    textTransform: 'capitalize',
    fontSize: '1rem'
  },
  clockTime: {
    fontFamily: 'monospace',
    fontSize: '3rem'
  }
});

export class Clock extends Component {
  state = {
    clock: {
      time: moment().format('HH:mm'),
      day: moment().format('dddd')
    }
  };

  componentDidMount() {
    this.clockTimer = setInterval(
      () =>
        this.setState({
          clock: {
            time: moment().format('HH:mm'),
            day: moment().format('dddd')
          }
        }),
      15000
    );
  }

  componentWillUnmount() {
    clearInterval(this.clockTimer);
  }

  render() {
    const { classes } = this.props;
    const {
      clock: { time, day }
    } = this.state;

    return (
      <Grid container item direction={'column'} alignItems={'center'}>
        <div className={classes.clockDay}>{day}</div>
        <div className={classes.clockTime}>{time}</div>
      </Grid>
    );
  }
}

Clock.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Clock);
