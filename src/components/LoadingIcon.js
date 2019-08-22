import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { withStyles, withTheme } from '@material-ui/core/styles';
import webkomIcon from 'app/static/webkom_kule.png';

const styles = theme => ({
  clockDay: {
    textTransform: 'capitalize',
    fontSize: '1rem'
  },
  clockTime: {
    fontFamily: 'monospace',
    fontSize: '3rem'
  },
  '@keyframes spin': {
    '100%': {
      '-moz-transform': 'rotate3d(1, -1, 1, 360deg)',
      '-webkit-transform': 'rotate3d(1, -1, 1, 360deg)',
      transform: 'rotate3d(1, -1, 1, 360deg)'
    }
  },

  loadingIcon: {
    '-webkit-animation': 'spin 1s linear infinite',
    '-moz-animation': 'spin 1s linear infinite',
    animation: 'spin 1s linear infinite'
  }
});

export const LoadingIcon = ({ classes, size }) => (
  <Grid container spacing={0}>
    <Grid item xs={12}>
      <img
        alt="Webkom"
        className={classes.loadingIcon}
        src={webkomIcon}
        style={{ height: `${size}vh`, width: `${size}vh` }}
      />
    </Grid>
  </Grid>
);

LoadingIcon.propTypes = {
  classes: PropTypes.object.isRequired,
  size: PropTypes.string
};

LoadingIcon.defaultProps = {
  size: 12
};

export default withTheme()(withStyles(styles)(LoadingIcon));
