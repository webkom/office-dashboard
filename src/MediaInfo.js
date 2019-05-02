import React from 'react';
import PropTypes from 'prop-types';
import Color from 'color';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import moment from 'moment';
import 'moment-duration-format';

const styles = theme => ({
  mediaText: {
    color: 'var(--text-color)',
    fontSize: '0.875rem',
    fontWeight: 400,
    fontFamily: 'Raleway, "Helvetica Neue", Arial, sans-serif',
    lineHeight: '1.46429em'
  },
  mediaImage: {
    backgroundImage: 'var(--image-url)',
    backgroundSize: '100% 100%',
    boxShadow: '0px 0px 3px 3px var(--shadow-color)',
    width: '5rem',
    height: '5rem'
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'flex-end'
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

const MediaInfo = props => {
  const {
    title,
    album,
    artist,
    content_id,
    current_time,
    duration,
    image
  } = props.content;
  const { classes, backgroundColor, textColor } = props;

  const progress = (current_time / duration) * 100;
  const formattedDuration = moment
    .duration(duration, 'seconds')
    .format('mm:ss', { trim: false });
  const formattedCurrent = moment
    .duration(current_time, 'seconds')
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

  return (
    <Grid
      container
      direction="row"
      justify="space-around"
      spacing={8}
      style={{
        '--text-color': textColor
      }}
      className={classes.mediaText}
    >
      <Grid item xs={3} className={classes.imageContainer}>
        <a href={url} target="_blank" rel="noopener noreferrer">
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
        <Grid item xs>
          <div>{`${artist} - ${title}`}</div>
          <div className={classes.albumText}>{album}</div>
        </Grid>
        <Grid
          item
          container
          alignItems="center"
          justify="space-between"
          spacing={8}
        >
          <Grid item>
            <div className={classes.currentTimeText}>{formattedCurrent}</div>
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
      </Grid>
    </Grid>
  );
};

MediaInfo.propTypes = {
  content: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired
};

export default withStyles(styles)(MediaInfo);
