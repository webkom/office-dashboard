import React, { Component } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { connect, PromiseState } from 'react-refetch';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import Grid from '@material-ui/core/Grid';
import Zoom from '@material-ui/core/Zoom';
import StatusItem from 'app/components/StatusBar/Item';
import {
  OFFICE_DOOR_URL,
  UPTIME_ROBOT_URL,
  UPTIME_ROBOT_POST_DATA
} from 'app/config';

const styles = theme => ({
  container: {
    padding: '10px 0',
    backgroundColor: theme.palette.primary.light,
    boxShadow: 'rgba(16, 23, 27, 0.52) 0px 0px 13px 3px inset',
    color: '#fff'
  },
  loading: {
    color: theme.palette.secondary.dark
  }
});

const statusColors = {
  paused: '#ff0000', // TODO
  not_checked: '#ff0000', // TODO
  up: '#80BA27',
  seems_down: '#ffd000',
  down: '#ff0000'
};

const getUptimeRobotColorFromStatus = status => {
  switch (status) {
    case 0:
      return statusColors.paused;
    case 1:
      return statusColors.not_checked;
    case 2:
      return statusColors.up;
    case 8:
      return statusColors.seems_down;
    case 9:
      return statusColors.down;
    default:
      return statusColors.paused;
  }
};

export class StatusBar extends Component {
  state = {
    isLoading: true,
    statuses: null
  };

  componentDidUpdate(prevProps) {
    const { officeDoorFetch, uptimeRobotFetch } = this.props;
    const { isLoading, statuses } = this.state;

    const allFetches = PromiseState.all([officeDoorFetch, uptimeRobotFetch]);

    if (!isLoading && allFetches.pending) {
      this.setState({ isLoading: true });
    } else if (isLoading && allFetches.rejected) {
      throw allFetches.reason.message;
    } else if (allFetches.fulfilled) {
      const [officeDoorValues, uptimeRobotValues] = allFetches.value;

      let newStatuses = [];
      const doorStatus = {
        name: 'Kontordør',
        color:
          officeDoorValues.status === 'OPEN'
            ? statusColors.up
            : statusColors.down
      };
      newStatuses.push(doorStatus);

      const uptimeRobotStatuses = uptimeRobotValues.monitors.map(monitor => ({
        name: monitor.friendly_name,
        color: getUptimeRobotColorFromStatus(monitor.status)
      }));
      newStatuses = newStatuses.concat(uptimeRobotStatuses);

      if (JSON.stringify(statuses) !== JSON.stringify(newStatuses)) {
        this.setState({
          isLoading: false,
          statuses: newStatuses
        });
      }
    }
  }

  render() {
    const { classes, width } = this.props;
    const { isLoading, statuses } = this.state;
    const isLarge = width !== undefined && ['lg', 'xl'].includes(width);

    return (
      <div>
        {!isLoading && (
          <Zoom in>
            <Grid
              item
              container
              alignItems={'center'}
              justify={'center'}
              className={classes.container}
            >
              <Grid
                item
                container
                xs={isLarge ? 8 : 10}
                justify={'space-evenly'}
              >
                {statuses.map(status => (
                  <StatusItem
                    key={`status-${status.name}`}
                    xs={12 / statuses.length}
                    iconColor={status.color}
                    name={status.name}
                  />
                ))}
              </Grid>
            </Grid>
          </Zoom>
        )}
      </div>
    );
  }
}

StatusBar.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  officeDoorFetch: PropTypes.object.isRequired,
  uptimeRobotFetch: PropTypes.object.isRequired
};

export default withWidth()(
  withStyles(styles)(
    connect(props => ({
      officeDoorFetch: {
        method: 'GET',
        mode: 'cors',
        url: OFFICE_DOOR_URL,
        refreshInterval: 5000
      },
      uptimeRobotFetch: {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        url: UPTIME_ROBOT_URL,
        refreshInterval: 300000,
        body: queryString.stringify(UPTIME_ROBOT_POST_DATA)
      }
    }))(StatusBar)
  )
);
