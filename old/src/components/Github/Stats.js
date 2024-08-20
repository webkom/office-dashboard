import React from 'react';
import PropTypes from 'prop-types';
import withWidth from '@material-ui/core/withWidth';
import { withStyles } from '@material-ui/core/styles';
import Octicon from '@githubprimer/octicons-react';
import TableIconRow from 'app/components/Table/IconRow';

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
    width: '20%',
    marginBottom: '-2px',
    textAlign: 'center'
  },
  icon: {
    color: theme.palette.secondary.main,
    opacity: 0.8
  },
  text: {
    width: '80%',
    opacity: 0.7,
    textAlign: 'left'
  },
  value: {
    fontFamily: 'monospace',
    opacity: 0.7
  }
});

const Stats = ({ classes, height, name, icon, value }) => (
  <TableIconRow
    className={classes.container}
    height={height}
    name={name}
    icon={<Octicon className={classes.icon} icon={icon} />}
    value={value}
    style={{
      '--value-container-height': `${height}%`
    }}
  />
);

Stats.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  icon: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired
};

export default withWidth()(withStyles(styles)(Stats));
