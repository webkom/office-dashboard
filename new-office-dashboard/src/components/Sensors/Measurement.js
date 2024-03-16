import React from "react";
import PropTypes from "prop-types";
import withWidth from "@material-ui/core/withWidth";
import { withStyles } from "@material-ui/core/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TableIconRow from "app/components/Table/IconRow";

const styles = theme => ({
  icon: {
    color: theme.palette.secondary.main,
    opacity: 0.8,
    paddingRight: "4px",
    fontSize: "12px"
  }
});

const Measurement = ({ classes, name, icon, value }) => (
  <TableIconRow
    className={classes.container}
    name={name}
    icon={<FontAwesomeIcon className={classes.icon} icon={icon} fixedWidth />}
    value={value}
    leftAlign
  />
);

Measurement.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  rightAlign: PropTypes.bool
};

Measurement.defaultProps = {
  rightAlign: false
};

export default withWidth()(withStyles(styles)(Measurement));
