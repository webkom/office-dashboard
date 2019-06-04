import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  container: {
    width: '100%',
    fontSize: '0.85rem'
  }
});

const Row = ({ children, classes }) => (
  <Grid item container className={classes.container}>
    {children}
  </Grid>
);

Row.propTypes = {
  children: PropTypes.node.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Row);
