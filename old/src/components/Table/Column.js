import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  column: {
    flexFlow: 'column',
    padding: '3px 6px 0px 6px'
  },
  leftColumn: {
    textAlign: 'left'
  },
  rightColumn: {
    textAlign: 'left',
    borderLeft: '1px solid rgba(255, 255, 255, 0.10)'
  }
});

const Column = ({ children, classes, xs, leftColumn, rightColumn }) => {
  const columnClasses = [classes.column];
  if (leftColumn) {
    columnClasses.push(classes.leftColumn);
  } else if (rightColumn) {
    columnClasses.push(classes.rightColumn);
  }

  return (
    <Grid item container xs={xs} className={classNames(columnClasses)}>
      {children}
    </Grid>
  );
};

Column.propTypes = {
  children: PropTypes.node.isRequired,
  classes: PropTypes.object.isRequired,
  leftColumn: PropTypes.bool,
  rightColumn: PropTypes.bool,
  xs: PropTypes.number
};

Column.defaultProps = {
  xs: 12,
  leftColumn: false,
  rightColum: false
};

export default withStyles(styles)(Column);
