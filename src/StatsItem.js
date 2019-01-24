import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const styles = theme => ({
  alignLeft: {
    textAlign: 'left'
  },
  alignRight: {
    textAlign: 'right'
  },
  statsIcon: {
    color: theme.palette.secondary.dark
  }
});

const StatsItem = props => {
  const { classes, icon, value, text, compact } = props;
  return (
    <Grid item>
      {compact ? (
        <span>
          <FontAwesomeIcon className={classes.statsIcon} icon={icon} /> {value}
        </span>
      ) : (
        <Grid container justify="center">
          <Grid item xs={3} className={classes.alignRight}>
            <FontAwesomeIcon className={classes.statsIcon} icon={icon} />
          </Grid>
          <Grid item xs={3}>
            {value}
          </Grid>
          <Grid item xs={6} className={classes.alignLeft}>
            {text}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

StatsItem.propTypes = {
  classes: PropTypes.object.isRequired,
  icon: PropTypes.object.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  text: PropTypes.string,
  compact: PropTypes.bool
};

StatsItem.defaultProps = {
  compact: false
};

export default withStyles(styles)(StatsItem);
