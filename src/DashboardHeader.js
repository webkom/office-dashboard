import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Color from 'color';
import ColorThief from 'color-thief';
import { connect, PromiseState } from 'react-refetch';
import { withStyles, withTheme } from '@material-ui/core/styles';
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
import moment from 'moment';
import {
  ENVIRONMENT_URL,
  OFFICE_DOOR_URL,
  OFFICE_SENSORS,
  OFFICE_CHROMECAST_URL
} from './config';
// import lightLogo from './static/abakus_logo_black_webkom.png';
import Measurement from './Measurement';
import MediaInfo from './MediaInfo';
import darkLogo from './static/abakus_logo_white_webkom.png';

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
  centerContainer: {
    display: 'flex'
  },
  centerContainerLeft: {
    display: 'flex',
    justifyContent: 'center',
    width: '20%'
  },
  centerContainerCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%'
  },
  centerContainerRight: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '20%'
  },
  logo: {
    height: '50px'
  },
  webkom: {
    height: '60px'
  },
  clock: {
    fontFamily: 'monospace',
    height: '100%',
    fontSize: '4.3vw',
    [theme.breakpoints.up('lg')]: {
      fontSize: '3vw'
    }
  },
  mediaContainer: {
    padding: '10px 0',
    backgroundColor: theme.palette.secondary.darkest,
    boxShadow: 'rgba(16, 23, 27, 0.52) 0px 0px 13px 3px inset'
  }
});

export class DashboardHeader extends Component {
  state = {
    isLoading: true,
    lastDatetime: null,
    sensors: null,
    environment: null,
    officeDoorOpen: null,
    chromecast: null,
    mediaImage: null,
    mediaColor: null,
    clock: moment().format('HH:mm')
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
      chromecast,
      mediaImage
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
        JSON.stringify(sensors) !== JSON.stringify(environmentValues.sensors) ||
        lastDatetime !== environmentValues.last_datetime ||
        officeDoorOpen !== officeDoorCurrentlyOpen ||
        JSON.stringify(chromecast) !== JSON.stringify(chromecastStatus)
      ) {
        const newState = {
          lastDatetime: environmentValues.last_datetime,
          sensors: environmentValues.sensors,
          environment,
          isLoading: false,
          officeDoorOpen: officeDoorCurrentlyOpen,
          chromecast: chromecastStatus
        };
        if (
          newState.chromecast &&
          newState.chromecast.image !== null &&
          (mediaImage === null || mediaImage.src !== newState.chromecast.image)
        ) {
          // Get the most dominant color of the media image
          const updatedMediaImage = new Image(300, 300);
          updatedMediaImage.crossOrigin = 'Anonymous';
          updatedMediaImage.src = newState.chromecast.image;

          const _ = this;
          updatedMediaImage.onload = function() {
            const colorThief = new ColorThief();
            const mediaColor = Color.rgb(
              colorThief.getColor(updatedMediaImage)
            );
            const backgroundColor = mediaColor.isLight()
              ? mediaColor.darken(0.5)
              : mediaColor;
            updatedMediaImage.setAttribute(
              'backgroundColor',
              backgroundColor.hsl().string()
            );
            const mediaPalette = colorThief.getPalette(updatedMediaImage);
            const mediaTextColors = mediaPalette
              .map(rgbArray => Color.rgb(rgbArray))
              .filter(color => color.isLight() !== backgroundColor.isLight());
            updatedMediaImage.setAttribute(
              'textColor',
              mediaTextColors.length > 0
                ? mediaTextColors[0].hsl().string()
                : '#FFFFFF'
            );
            newState.mediaImage = updatedMediaImage;
            _.setState(newState);
          };
        } else {
          this.setState(newState);
        }
      }
    }
  }

  componentDidMount() {
    this.clockTimer = setInterval(
      () =>
        this.setState({
          clock: moment().format('HH:mm')
        }),
      15000
    );
  }

  componentWillUnmount() {
    clearInterval(this.clockTimer);
  }

  render() {
    const { classes, width, theme } = this.props;
    const {
      isLoading,
      environment,
      officeDoorOpen,
      chromecast,
      mediaImage,
      clock
    } = this.state;
    const isMobile = width !== undefined && width === 'xs';

    const mediaColor =
      mediaImage !== null
        ? mediaImage.getAttribute('backgroundColor')
        : theme.palette.secondary.darkest;
    const mediaTextColor =
      mediaImage !== null ? mediaImage.getAttribute('textColor') : '#FFFFFF';

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
              <Grid item xs={8} className={classes.centerContainer}>
                <div className={classes.centerContainerLeft} />
                <div className={classes.centerContainerCenter}>
                  <img
                    alt="Abakus Linjeforening"
                    className={classes.logo}
                    src={darkLogo}
                  />
                </div>
                <div
                  className={classNames(
                    classes.centerContainerRight,
                    classes.clock
                  )}
                >
                  {clock}
                </div>
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
        {chromecast &&
          chromecast.artist !== null &&
          chromecast.state !== 'UNKNOWN' && (
            <Zoom in>
              <Grid
                container
                alignItems="center"
                justify="center"
                className={classes.mediaContainer}
                style={{ backgroundColor: mediaColor }}
              >
                <Grid item xs={isMobile ? 11 : 5}>
                  <MediaInfo
                    content={chromecast}
                    backgroundColor={mediaColor}
                    textColor={mediaTextColor}
                  />
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
  theme: PropTypes.object.isRequired,
  environmentFetch: PropTypes.object.isRequired,
  officeDoorFetch: PropTypes.object.isRequired,
  officeChromecastFetch: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired
};

export default withWidth()(
  withTheme()(
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
  )
);
