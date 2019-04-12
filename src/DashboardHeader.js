import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect, PromiseState } from 'react-refetch';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import withWidth from '@material-ui/core/withWidth';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Zoom from '@material-ui/core/Zoom';
import { faThermometerHalf } from '@fortawesome/free-solid-svg-icons';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
import { faCompressArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { faSkull } from '@fortawesome/free-solid-svg-icons';
import { faIndustry } from '@fortawesome/free-solid-svg-icons';
import { faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { faDoorClosed } from '@fortawesome/free-solid-svg-icons';
import {
  ENVIRONMENT_URL,
  OFFICE_DOOR_URL,
  OFFICE_SENSORS,
  OFFICE_CHROMECAST_URL
} from './config';
// import lightLogo from './static/abakus_logo_black.png';
import Measurement from './Measurement';
import MediaInfo from './MediaInfo';
import darkLogo from './static/abakus_logo_white.png';

const styles = theme => ({
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
    padding: 20,
    fontSize: '1rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.9rem'
    }
  },
  leftAlign: {
    textAlign: 'left'
  },
  rightAlign: {
    textAlign: 'right'
  },
  loading: {
    color: theme.palette.secondary.dark
  },
  logo: {
    height: '50px'
  },
  webkom: {
    height: '60px'
  },
  mediaContainer: {
    padding: '10px 0',
    backgroundColor: theme.palette.secondary.darkest,
    boxShadow: 'rgba(16, 23, 27, 0.52) 0px 10px 20px 6px inset'
  }
});

export class DashboardHeader extends Component {
  state = {
    isLoading: true,
    lastDatetime: null,
    sensors: null,
    environment: null,
    officeDoorOpen: null,
    chromecast: null
  };

  componentDidUpdate(prevProps) {
    const {
      environmentFetch,
      officeDoorFetch,
      officeChromecastFetch
    } = this.props;
    const {
      isLoading,
      sensors,
      lastDatetime,
      officeDoorOpen,
      chromecast
    } = this.state;

    const allFetches = PromiseState.all([
      environmentFetch,
      officeDoorFetch,
      officeChromecastFetch
    ]);

    if (!isLoading && allFetches.pending) {
      this.setState({ isLoading: true });
    } else if (isLoading && allFetches.rejected) {
      throw allFetches.reason.message;
    } else if (allFetches.fulfilled) {
      /*
    } else if (
      environmentFetch.fulfilled &&
      (sensors !== environmentFetch.value.sensors ||
        lastDatetime !== environmentFetch.value.last_datetime)
    ) {
    */
      const [
        environmentValues,
        officeDoorValues,
        officeChromecastValues
      ] = allFetches.value;

      // Office Door
      const officeDoorCurrentlyOpen = officeDoorValues.status === 'OPEN';

      // Only use the sensors in the office
      const officeSensors = Object.keys(environmentValues.sensors)
        .filter(key => OFFICE_SENSORS.includes(key))
        .reduce((obj, key) => {
          obj[key] = environmentValues.sensors[key];
          return obj;
        }, {});

      // Sum all the values
      const environment = Object.values(officeSensors).reduce(
        (prev, cur) => ({
          TVOC: prev.TVOC + cur.TVOC,
          eCO2: prev.eCO2 + cur.eCO2,
          humidity: prev.humidity + cur.humidity,
          pressure: prev.pressure + cur.pressure,
          temperature: prev.temperature + cur.temperature
        }),
        {
          TVOC: 0,
          eCO2: 0,
          humidity: 0,
          pressure: 0,
          temperature: 0
        }
      );

      // Get the average value of each measurement
      Object.keys(environment).forEach(key => {
        environment[key] =
          Math.round(
            (environment[key] / Object.keys(officeSensors).length) * 100
          ) / 100;
      });

      const chromecastStatus = officeChromecastValues.current_status;

      if (
        sensors !== environmentValues.sensors ||
        lastDatetime !== environmentValues.last_datetime ||
        officeDoorOpen !== officeDoorCurrentlyOpen ||
        chromecast !== chromecastStatus
      ) {
        this.setState({
          lastDatetime: environmentValues.last_datetime,
          sensors: environmentValues.sensors,
          environment,
          isLoading: false,
          officeDoorOpen: officeDoorCurrentlyOpen,
          chromecast: chromecastStatus
        });
      }
    }
  }

  render() {
    const { classes, width } = this.props;
    const { isLoading, environment, officeDoorOpen, chromecast } = this.state;
    const isMobile = width !== undefined && width === 'xs';
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
              <Grid item xs={2}>
                {isLoading ? (
                  <CircularProgress className={classes.loading} size={'4vh'} />
                ) : (
                  <Grid container direction={'column'}>
                    <Measurement
                      icon={faThermometerHalf}
                      value={`${environment.temperature} °C`}
                      alt="Temperature"
                    />
                    <Measurement
                      icon={faCloud}
                      value={`${environment.humidity} %`}
                      alt="Humidity"
                    />
                    <Measurement
                      icon={faCompressArrowsAlt}
                      value={`${Math.round(environment.pressure) / 100} hPa`}
                      alt="Pressure"
                    />
                  </Grid>
                )}
              </Grid>
              <Grid item xs={8}>
                <img
                  alt="Abakus Linjeforening"
                  className={classes.logo}
                  src={darkLogo}
                />
              </Grid>
              <Grid item xs={2}>
                {isLoading ? (
                  <CircularProgress className={classes.loading} size={'4vh'} />
                ) : (
                  <Grid container direction={'column'}>
                    <Measurement
                      icon={faSkull}
                      value={`${environment.TVOC} ppb`}
                      alt="TVOC (Total Volatile Organic Compound) concentration parts per billion (ppb)"
                      rightAlign
                    />
                    <Measurement
                      icon={faIndustry}
                      value={`${environment.eCO2} ppm`}
                      alt="eCO2 (equivalent calculated carbon-dioxide) concentration parts per million (ppm)"
                      rightAlign
                    />
                    <Measurement
                      icon={officeDoorOpen ? faDoorOpen : faDoorClosed}
                      value={`${officeDoorOpen ? 'Åpen' : 'Lukket'}`}
                      alt="Kontordørstatus"
                      rightAlign
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}
        </AppBar>
        {chromecast && chromecast.state != 'UNKNOWN' && (
          <Zoom in>
            <Grid
              container
              alignItems="center"
              justify="center"
              className={classes.mediaContainer}
            >
              <Grid xs={isMobile ? 11 : 5}>
                <MediaInfo content={chromecast} />
              </Grid>
            </Grid>
          </Zoom>
        )}
      </div>
    );
  }
}

DashboardHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  environmentFetch: PropTypes.object.isRequired,
  officeDoorFetch: PropTypes.object.isRequired,
  officeChromecastFetch: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired
};

export default withWidth()(
  withStyles(styles)(
    connect(props => ({
      environmentFetch: {
        method: 'GET',
        mode: 'cors',
        url: ENVIRONMENT_URL,
        refreshInterval: 5000
      },
      officeDoorFetch: {
        method: 'GET',
        mode: 'cors',
        url: OFFICE_DOOR_URL,
        refreshInterval: 5000
      },
      officeChromecastFetch: {
        method: 'GET',
        mode: 'cors',
        url: OFFICE_CHROMECAST_URL,
        refreshInterval: 5000
      }
    }))(DashboardHeader)
  )
);
