import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import CloseIcon from "@material-ui/icons/Close";
import green from "@material-ui/core/colors/green";
import amber from "@material-ui/core/colors/amber";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import WarningIcon from "@material-ui/icons/Warning";
import { withStyles } from "@material-ui/core/styles";

let notifyFn;

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
};

const styles1 = theme => ({
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  info: {
    backgroundColor: theme.palette.primary.dark
  },
  warning: {
    backgroundColor: amber[700]
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing.unit
  },
  message: {
    color: "#fff",
    display: "flex",
    alignItems: "center"
  }
});

function DashboardSnackbarContent(props) {
  const { classes, className, message, onClose, variant, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={classNames(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={classNames(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          className={classes.close}
          onClick={onClose}
        >
          <CloseIcon className={classes.icon} />
        </IconButton>
      ]}
      {...other}
    />
  );
}

DashboardSnackbarContent.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  message: PropTypes.node,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(["success", "warning", "error", "info"]).isRequired
};

const DashboardSnackbarContentWrapper = withStyles(styles1)(
  DashboardSnackbarContent
);

const styles2 = theme => ({
  margin: {
    margin: theme.spacing.unit
  }
});

class DashboardSnackbar extends React.Component {
  queue = [];

  state = {
    open: false,
    messageInfo: {}
  };

  componentDidMount() {
    notifyFn = this.notify;
  }

  handleClick = () => {
    this.setState({ open: true });
  };

  handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    this.setState({ open: false });
  };

  handleExited = () => {
    this.processQueue();
  };

  notify = (message, variant) => {
    if (this.queue.length > 0 && this.queue[0].message === message) {
      return;
    }
    this.queue.push({
      message,
      variant,
      key: new Date().getTime()
    });

    if (this.state.open) {
      this.setState({ open: false });
    } else {
      this.processQueue();
    }
  };

  processQueue = () => {
    if (this.queue.length > 0) {
      this.setState({
        messageInfo: this.queue.shift(),
        open: true
      });
    }
  };

  render() {
    const { messageInfo } = this.state;

    return (
      <div>
        <Snackbar
          key={messageInfo.key}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
          open={this.state.open}
          autoHideDuration={10000}
          onClose={this.handleClose}
          onExited={this.handleExit}
        >
          <DashboardSnackbarContentWrapper
            onClose={this.handleClose}
            variant={messageInfo.variant}
            message={messageInfo.message}
          />
        </Snackbar>
      </div>
    );
  }
}

DashboardSnackbar.propTypes = {
  classes: PropTypes.object.isRequired
};

export function notify(message, variant = "info") {
  notifyFn(message, variant);
}

export default withStyles(styles2)(DashboardSnackbar);
