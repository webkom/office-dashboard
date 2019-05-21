import React from 'react';
import PropTypes from 'prop-types';
import withWidth from '@material-ui/core/withWidth';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TableRow from 'app/components/Table/Row';
import TableCell from 'app/components/Table/Cell';

const styles = theme => ({
  container: {
    width: '100%',
    height: 'var(--value-container-height)',
    fontSize: '0.85rem'
  },
  containerLeft: {
    width: '60%',
    textAlign: 'left'
  },
  containerRight: {
    width: '40%',
    textAlign: 'right'
  },
  iconContainer: {
    marginBottom: '-2px',
    textAlign: 'center'
  },
  textContainer: {
    paddingLeft: '4px',
    justifyContent: 'flex-start'
  },
  text: {
    opacity: 0.7
  },
  value: {
    fontFamily: 'monospace',
    opacity: 0.7,
    marginBottom: '-4px'
  }
});

const IconRow = ({ classes, height, name, icon, value }) => (
  <TableRow
    className={classes.container}
    style={{
      '--value-container-height': `${height}%`
    }}
  >
    <TableCell xs={7} leftAlign>
      <Grid
        item
        container
        xs={2}
        className={classes.iconContainer}
        justify={'center'}
      >
        {icon}
      </Grid>
      <Grid item container xs={10} className={classes.textContainer}>
        <span className={classes.text}>
          {name !== null ? `${name}:` : '==>'}
        </span>
      </Grid>
    </TableCell>
    <TableCell xs={5} rightAlign>
      <span className={classes.value}>{value}</span>
    </TableCell>
  </TableRow>
);

IconRow.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired
};

export default withWidth()(withStyles(styles)(IconRow));
