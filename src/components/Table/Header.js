import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '2.5vh',
    letterSpacing: '4px',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    borderBottom: '1px solid rgba(255, 255, 255, 0.10)'
  }
});

const Header = ({ children, classes }) => (
  <Grid item className={classes.header}>
    {children}
  </Grid>
);

Header.propTypes = {
  children: PropTypes.node.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Header);
