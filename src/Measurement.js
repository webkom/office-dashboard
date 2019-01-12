import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import withWidth from '@material-ui/core/withWidth';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const styles = theme => ({
  leftAlign: {
    textAlign: 'left'
  },
  rightAlign: {
    textAlign: 'right'
  },
  measurementIcon: {
    color: theme.palette.secondary.dark
  },
  measurementValue: {
    opacity: 0.7
  },
  container: {
    whiteSpace: 'nowrap'
  }
});

const Measurement = props => {
  const { classes, width, icon, value, alt, rightAlign } = props;
  const expand = width !== undefined && width === 'sm';
  return (
    <Grid item title={alt}>
      {rightAlign ? (
        <Grid container className={classes.container}>
          <Grid
            item
            xs={10 - (expand ? 1 : 0)}
            className={classNames(classes.rightAlign, classes.measurementValue)}
          >
            {value}
          </Grid>
          <Grid item xs={2 + (expand ? 1 : 0)}>
            <FontAwesomeIcon className={classes.measurementIcon} icon={icon} />
          </Grid>
        </Grid>
      ) : (
        <Grid container className={classes.container}>
          <Grid item xs={2 + (expand ? 1 : 0)}>
            <FontAwesomeIcon className={classes.measurementIcon} icon={icon} />
          </Grid>
          <Grid
            item
            xs={10 - (expand ? 1 : 0)}
            className={classNames(classes.leftAlign, classes.measurementValue)}
          >
            {value}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

Measurement.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  rightAlign: PropTypes.bool
};

Measurement.defaultProps = {
  rightAlign: false
};

export default withWidth()(withStyles(styles)(Measurement));
