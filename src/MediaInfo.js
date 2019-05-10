import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Color from 'color';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import 'moment-duration-format';

const styles = theme => ({
  centerMediaText: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    textAlign: 'right'
  },
  mediaFont: {
    color: 'var(--text-color)',
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: '1.46429em'
  },
  mediaText: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  mediaImage: {
    backgroundImage: 'var(--image-url)',
    backgroundSize: '100% 100%',
    boxShadow: '0px 0px 3px 3px var(--shadow-color)',
    width: '5rem',
    height: '5rem'
  },
  pauseIcon: {
    color: '#ffffff',
    fontSize: '50px',
    position: 'absolute',
    padding: '17.125px 0px 0px 17.125px'
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative'
  },
  albumText: {
    opacity: 0.7
  },
  durationText: {
    fontSize: '0.7rem',
    opacity: 0.8
  },
  currentTimeText: {
    fontSize: '0.7rem',
    opacity: 0.8
  },
  progressContainer: {
    flex: '1 1 auto'
  },
  progress: {
    borderRadius: '0.1rem'
  },
  progressBar: {
    backgroundColor: 'var(--progressbar-color)'
  },
  progressBarBackground: {
    backgroundColor: 'var(--progressbar-background-color)'
  }
});

export class MediaInfo extends Component {
  state = {
    currentTime: null,
    isPaused: false
  };

  setTimer(time, force = false) {
    if (!force && time >= this.props.content.duration) {
      // Stop the timer from overflowing when the current time
      this.stopTimer();
      this.setState({
        currentTime: this.props.content.duration
      });
    } else {
      /*
       * Only update if the difference between our simulated
       * current time and the actual current time is higher
       * than 1 second. This stops the timer from jumping that
       * much.
       */
      const diff = time - this.state.currentTime;
      const isBefore = diff < 0;
      const isAboveThreshold = Math.abs(diff) > 1;
      if (force || (!isBefore && isAboveThreshold)) {
        this.stopTimer();
        this.setState(
          {
            currentTime: time
          },
          () => {
            this.timer = setInterval(() => {
              // Increase the simulated timer with 1 second
              const newTime = this.state.currentTime + 1;
              if (newTime >= this.props.content.duration) {
                // Stop the timer if the simulated timer is larger than the duration
                this.setState({
                  currentTime: this.props.content.duration
                });
                this.stopTimer();
              } else if (!this.state.isPaused) {
                // Don't run the timer if the player is paused
                this.setState({
                  currentTime: newTime
                });
              }
            }, 1000);
          }
        );
      }
    }
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  componentDidUpdate(prevProps) {
    const stateCurrent = this.state.currentTime;
    const prevCurrent = prevProps.content.current_time;
    const newCurrent = this.props.content.current_time;
    if ((this.props.content.state === 'PAUSED') !== this.state.isPaused) {
      this.setState({
        isPaused: this.props.content.state === 'PAUSED'
      });
    }
    if (stateCurrent == null || newCurrent !== prevCurrent) {
      this.setTimer(
        newCurrent,
        prevProps.content.duration !== this.props.content.duration
      );
    }
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  render() {
    const {
      title,
      album,
      artist,
      content_id,
      duration,
      image
    } = this.props.content;
    const { classes, backgroundColor, textColor } = this.props;
    const { currentTime, isPaused } = this.state;
    const urlParams = new URLSearchParams(window.location.search);
    const hideMediaProgressBar = urlParams.has('hideMediaProgressBar');

    const progress = (currentTime / duration) * 100;
    const formattedDuration = moment
      .duration(duration, 'seconds')
      .format('mm:ss', { trim: false });
    const formattedCurrent = moment
      .duration(currentTime, 'seconds')
      .format('mm:ss', { trim: false });

    const url = `https://open.spotify.com/embed/track/${content_id.replace(
      'spotify:track:',
      ''
    )}`;

    const textColorInstance = Color(textColor);
    const imageShadowColor = Color(backgroundColor)
      .darken(0.2)
      .hsl()
      .string();
    const progressBarColor = textColorInstance
      .fade(0.3)
      .hsl()
      .string();
    const progressBarBackgroundColor = textColorInstance
      .fade(0.8)
      .hsl()
      .string();

    const mediaHeaderText = `${artist} - ${title}`;

    return (
      <Grid
        container
        direction="row"
        justify="space-around"
        spacing={8}
        style={{
          '--text-color': textColor
        }}
        className={classes.mediaFont}
      >
        <Grid item container xs={3} className={classes.imageContainer}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {isPaused && (
              <FontAwesomeIcon className={classes.pauseIcon} icon={faPause} />
            )}
            <div
              className={classes.mediaImage}
              style={{
                '--image-url': `url(${image})`,
                '--shadow-color': imageShadowColor
              }}
            />
          </a>
        </Grid>
        <Grid item xs={9} container direction="column" justify="space-between">
          <Grid
            item
            xs
            className={
              hideMediaProgressBar ? classes.centerMediaText : classes.none
            }
          >
            <div className={classes.mediaText} title={mediaHeaderText}>
              {mediaHeaderText}
            </div>
            <div
              className={classNames(classes.mediaText, classes.albumText)}
              title={album}
            >
              {album}
            </div>
          </Grid>
          {!hideMediaProgressBar && (
            <Grid
              item
              container
              alignItems="center"
              justify="space-between"
              spacing={8}
            >
              <Grid item>
                <div className={classes.currentTimeText}>
                  {formattedCurrent}
                </div>
              </Grid>
              <Grid item className={classes.progressContainer}>
                <LinearProgress
                  className={classes.progress}
                  style={{
                    '--progressbar-color': progressBarColor,
                    '--progressbar-background-color': progressBarBackgroundColor
                  }}
                  classes={{
                    colorPrimary: classes.progressBarBackground,
                    barColorPrimary: classes.progressBar
                  }}
                  variant="determinate"
                  value={progress}
                />
              </Grid>
              <Grid item>
                <div className={classes.durationText}>{formattedDuration}</div>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    );
  }
}

MediaInfo.propTypes = {
  content: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired
};

export default withStyles(styles)(MediaInfo);
