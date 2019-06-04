import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  container: {
    flexWrap: 'nowrap'
  },
  alignLeft: {},
  alignRight: {
    justifyContent: 'flex-end'
  }
});

const Cell = ({ children, classes, xs, leftAlign, rightAlign }) => (
  <Grid
    container
    item
    alignItems={'center'}
    xs={xs}
    className={classNames(
      classes.container,
      rightAlign ? classes.alignRight : classes.alignLeft
    )}
  >
    {children}
  </Grid>
);

Cell.propTypes = {
  children: PropTypes.node.isRequired,
  classes: PropTypes.object.isRequired,
  xs: PropTypes.number,
  leftAlign: PropTypes.bool,
  rightAlign: PropTypes.bool
};

Cell.defaultProps = {
  xs: 12,
  leftAlign: false,
  rightAlign: false
};

export default withStyles(styles)(Cell);
