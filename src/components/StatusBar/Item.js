import React from 'react';
import PropTypes from 'prop-types';
import withWidth from '@material-ui/core/withWidth';
import { withStyles } from '@material-ui/core/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TableIconRow from 'app/components/Table/IconRow';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  container: {
    color: '#fff',
    fontSize: '1rem',
    [theme.breakpoints.down('xs')]: {
      fontSize: '0.65rem'
    }
  },
  icon: {
    color: theme.palette.secondary.main,
    opacity: 0.8,
    paddingRight: '4px',
    fontSize: '12px'
  },
  circle: {
    width: '15px',
    height: '15px',
    backgroundColor: '#bbb',
    borderRadius: '50%',
    display: 'inline-block',
    [theme.breakpoints.down('xs')]: {
      width: '10px',
      height: '10px'
    }
  },
  name: {
    display: 'inline-block',
    paddingLeft: '5px',
    marginBottom: '3px',
    [theme.breakpoints.down('xs')]: {
      paddingLeft: '0px'
    }
  }
});

const Item = ({ classes, xs, width, iconColor, name }) => (
  <Grid
    item
    container
    direction={width !== undefined && width === 'xs' ? 'column' : 'row'}
    justify={'center'}
    alignItems={'center'}
    className={classes.container}
    xs={xs}
  >
    <Grid item>
      <span
        className={classes.circle}
        style={{
          backgroundColor: iconColor
        }}
      />
    </Grid>
    <Grid item>
      <span className={classes.name}>{name}</span>
    </Grid>
  </Grid>
);

Item.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  xs: PropTypes.number.isRequired,
  iconColor: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

export default withWidth()(withStyles(styles)(Item));
