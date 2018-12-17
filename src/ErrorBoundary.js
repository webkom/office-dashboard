import React from 'react';
import PropTypes from 'prop-types';

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
    if (this.state.hasError) {
      // Sleep for 30 seconds before reloading the page
      setInterval(function() {
        window.location.reload();
      }, 30000);
      // TODO: Create an error popup
      return "Oh noes! Reloading in 30 seconds.";
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
  presenceFetch: PropTypes.object.isRequired,
  onError: PropTypes.func.isRequired
};

export default ErrorBoundary;
