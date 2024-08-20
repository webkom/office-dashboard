import React from 'react';
import PropTypes from 'prop-types';
import withWidth from '@material-ui/core/withWidth';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  container: {
    height: '100%'
  }
});

const Body = ({ classes, children }) => (
  <Grid item container className={classes.container}>
    {children}
  </Grid>
);

Body.propTypes = {
  children: PropTypes.node.isRequired,
  classes: PropTypes.object.isRequired
};

export default withWidth()(withStyles(styles)(Body));
