import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';

const styles = theme => ({
  frownIcon: {
    color: theme.palette.secondary.dark
  }
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    // You can also log the error to an error reporting service
    this.props.onError(error);
  }

  render() {
    const { classes } = this.props;
    if (this.state.hasError) {
      // Sleep for 30 seconds before reloading the page
      setInterval(function() {
        window.location.reload();
      }, 30000);
      return (
        <div>
          <h1>
            Oh noes!{' '}
            <FontAwesomeIcon className={classes.frownIcon} icon={faFrown} />
          </h1>
          <p>Det skjedde noe feil, refresher om 30 sekunder.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  onError: PropTypes.func.isRequired
};

export default withStyles(styles)(ErrorBoundary);
