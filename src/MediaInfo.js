import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import moment from 'moment';
import 'moment-duration-format';

const styles = theme => ({
  mediaImage: {
    width: '100%'
  },
  albumText: {
    opacity: 0.7
  },
  durationText: {
    fontSize: '0.7rem',
    opacity: 0.8,
    paddingLeft: '0.5rem'
  },
  currentTimeText: {
    fontSize: '0.7rem',
    opacity: 0.8,
    textAlign: 'right',
    paddingRight: '0.5rem'
  },
  progress: {
    borderRadius: '0.1rem'
  },
  progressBarBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  progressBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)'
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

  const { classes } = props;

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

  return (
    <Grid container direction="row" justify="space-around" spacing={8}>
      <Grid item xs={3}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img src={image} className={classes.mediaImage} alt="" />
        </a>
      </Grid>
      <Grid item xs={9} container direction="column" justify="space-between">
        <Grid item>
          <Typography>{`${artist} - ${title}`}</Typography>
          <Typography className={classes.albumText}>{album}</Typography>
        </Grid>
        <Grid item container alignItems="center" justify="space-between">
          <Grid item xs={2}>
            <Typography className={classes.currentTimeText}>
              {formattedCurrent}
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <LinearProgress
              className={classes.progress}
              classes={{
                colorPrimary: classes.progressBarBackground,
                barColorPrimary: classes.progressBar
              }}
              variant="determinate"
              value={progress}
            />
          </Grid>
          <Grid item xs={2}>
            <Typography className={classes.durationText}>
              {formattedDuration}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid />
    </Grid>
  );
};

MediaInfo.propTypes = {
  content: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MediaInfo);
