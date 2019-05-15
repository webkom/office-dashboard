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
import { faSkull } from '@fortawesome/free-solid-svg-icons';
import { faIndustry } from '@fortawesome/free-solid-svg-icons';
/*
import { faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { faDoorClosed } from '@fortawesome/free-solid-svg-icons';
*/
import moment from 'moment';
import {
  ENVIRONMENT_URL,
  GITHUB_STATS_URL,
  OFFICE_DOOR_URL,
  OFFICE_SENSORS,
  OFFICE_CHROMECAST_URL
} from './config';
// import lightLogo from './static/abakus_logo_black_webkom.png';
import Measurement from './Measurement';
import MediaInfo from './MediaInfo';
import GithubRepository from './GithubRepository';
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
  logo: {
    height: '50px'
  },
  webkom: {
    height: '60px'
  },
  clock: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  clockDay: {
    textTransform: 'capitalize',
    fontSize: '1rem'
  },
  clockTime: {
    fontFamily: 'monospace',
    fontSize: '3rem'
  },
  mediaContainer: {
    padding: '10px 0',
    backgroundColor: theme.palette.secondary.darkest,
    boxShadow: 'rgba(16, 23, 27, 0.52) 0px 0px 13px 3px inset'
  },
  githubContainer: {
    display: 'flex',
    height: '100%'
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
    githubRepositories: null,
    clock: {
      time: moment().format('HH:mm'),
      day: moment().format('dddd')
    }
  };

  componentDidUpdate(prevProps) {
    const {
      environmentFetch,
      githubFetch,
      officeDoorFetch,
      officeChromecastFetch
    } = this.props;
    const {
      isLoading,
      sensors,
      lastDatetime,
      officeDoorOpen,
      chromecast,
      mediaImage,
      githubRepositories
    } = this.state;

    const allFetches = PromiseState.all([
      environmentFetch,
      githubFetch,
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
        githubValues,
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
      const newGithubRepositories = Object.values(githubValues.repositories);

      if (
        JSON.stringify(sensors) !== JSON.stringify(environmentValues.sensors) ||
        lastDatetime !== environmentValues.last_datetime ||
        JSON.stringify(githubRepositories) !==
          JSON.stringify(newGithubRepositories) ||
        officeDoorOpen !== officeDoorCurrentlyOpen ||
        JSON.stringify(chromecast) !== JSON.stringify(chromecastStatus)
      ) {
        const newState = {
          lastDatetime: environmentValues.last_datetime,
          sensors: environmentValues.sensors,
          environment,
          isLoading: false,
          officeDoorOpen: officeDoorCurrentlyOpen,
          chromecast: chromecastStatus,
          githubRepositories: newGithubRepositories
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
    const { classes, width, theme } = this.props;
    const {
      isLoading,
      environment,
      // officeDoorOpen,
      chromecast,
      mediaImage,
      githubRepositories,
      clock: { time, day }
    } = this.state;
    const isMobile = width !== undefined && width === 'xs';
    const isLarge = width !== undefined && ['lg', 'xl'].includes(width);

    const mediaColor =
      mediaImage !== null
        ? mediaImage.getAttribute('backgroundColor')
        : theme.palette.secondary.darkest;
    const mediaTextColor =
      mediaImage !== null ? mediaImage.getAttribute('textColor') : '#FFFFFF';

    const repositoryWidth =
      githubRepositories !== null && githubRepositories.length > 0
        ? 100 / githubRepositories.length
        : 100;

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
                {isLoading ? (
                  <CircularProgress className={classes.loading} size={'4vh'} />
                ) : (
                  <Grid
                    item
                    container
                    justify={'space-evenly'}
                    style={{ flexWrap: 'nowrap' }}
                  >
                    {githubRepositories.map(repository => (
                      <GithubRepository
                        containerWidth={repositoryWidth}
                        key={`repository-${repository.name}`}
                        repository={repository}
                      />
                    ))}
                  </Grid>
                )}
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
                <Grid
                  item
                  container
                  xs={8}
                  className={classNames(classes.clock)}
                >
                  <div className={classes.clockDay}>{day}</div>
                  <div className={classes.clockTime}>{time}</div>
                </Grid>
                <Grid item container xs={4} alignItems="center">
                  {isLoading ? (
                    <CircularProgress
                      className={classes.loading}
                      size={'4vh'}
                    />
                  ) : (
                    <Grid item container direction={'column'}>
                      <Measurement
                        icon={faThermometerHalf}
                        value={`${environment.temperature} °C`}
                        alt="Temperature"
                        rightAlign
                      />
                      <Measurement
                        icon={faCloud}
                        value={`${environment.humidity} %`}
                        alt="Humidity"
                        rightAlign
                      />
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
                      {/*
                    <Measurement
                      icon={officeDoorOpen ? faDoorOpen : faDoorClosed}
                      value={`${officeDoorOpen ? 'Åpen' : 'Lukket'}`}
                      alt="Kontordørstatus"
                      rightAlign
                    />
                    */}
                    </Grid>
                  )}
                </Grid>
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
  githubFetch: PropTypes.object.isRequired,
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
        githubFetch: {
          method: 'GET',
          mode: 'cors',
          url: GITHUB_STATS_URL,
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
