import React from 'react';
import PropTypes from 'prop-types';
import withWidth from '@material-ui/core/withWidth';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  container: {
    padding: 'var(--container-padding)',
    whiteSpace: 'pre'
  }
});

const Table = ({ classes, children, width, xs }) => {
  const isLarge = width !== undefined && ['lg', 'xl'].includes(width);
  return (
    <Grid
      item
      container
      xs={xs}
      className={classes.container}
      style={{
        '--container-padding': isLarge ? '0px 8px' : '0px 6px'
      }}
    >
      {children}
    </Grid>
  );
};

Table.propTypes = {
  children: PropTypes.node.isRequired,
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  xs: PropTypes.number
};

Table.defaultProps = {
  xs: 12
};

export default withWidth()(withStyles(styles)(Table));
