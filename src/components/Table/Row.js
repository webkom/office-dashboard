import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  container: {
    width: '100%',
    height: 'var(--value-container-height)',
    fontSize: '0.85rem'
  }
});

const Row = ({ children, classes, height }) => (
  <Grid
    item
    container
    className={classes.container}
    style={{
      '--value-container-height': `${height}%`
    }}
  >
    {children}
  </Grid>
);

Row.propTypes = {
  children: PropTypes.node.isRequired,
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired
};

export default withStyles(styles)(Row);
