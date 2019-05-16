import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-refetch';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import { GITHUB_STATS_URL } from 'app/config';
import Repository from 'app/components/Github/Repository';

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1
  },
  toolbar: {
    justifyContent: 'center',
    flex: '1 1 auto',
    textAlign: 'center',
    padding: 20,
    fontSize: '1rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.9rem'
    }
  },
  leftAlign: {
    textAlign: 'left'
  },
  rightAlign: {
    textAlign: 'right'
  },
  loading: {
    color: theme.palette.secondary.dark
  },
  logo: {
    height: '50px'
  },
  webkom: {
    height: '60px'
  },
  clock: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  clockDay: {
    textTransform: 'capitalize',
    fontSize: '1rem'
  },
  clockTime: {
    fontFamily: 'monospace',
    fontSize: '3rem'
  },
  mediaContainer: {
    padding: '10px 0',
    backgroundColor: theme.palette.secondary.darkest,
    boxShadow: 'rgba(16, 23, 27, 0.52) 0px 0px 13px 3px inset'
  },
  githubContainer: {
    display: 'flex',
    height: '100%'
  }
});

export class Github extends Component {
  state = {
    isLoading: true,
    lastDatetime: null,
    repositories: null
  };

  componentDidUpdate(prevProps) {
    const { apiFetch } = this.props;
    const { isLoading, repositories } = this.state;

    if (!isLoading && apiFetch.pending) {
      this.setState({ isLoading: true });
    } else if (isLoading && apiFetch.rejected) {
      throw apiFetch.reason.message;
    } else if (apiFetch.fulfilled) {
      const response = apiFetch.value;
      const newRepositories = Object.values(response.repositories);

      if (JSON.stringify(repositories) !== JSON.stringify(newRepositories)) {
        const newState = {
          lastDatetime: response.last_datetime,
          isLoading: false,
          repositories: newRepositories
        };
        this.setState(newState);
      }
    }
  }

  render() {
    const { classes } = this.props;
    const { isLoading, repositories } = this.state;

    const repositoryWidth =
      repositories !== null && repositories.length > 0
        ? 100 / repositories.length
        : 100;

    return (
      <div>
        {isLoading ? (
          <CircularProgress className={classes.loading} size={'4vh'} />
        ) : (
          <Grid
            item
            container
            justify={'space-evenly'}
            style={{ flexWrap: 'nowrap' }}
          >
            {repositories.map(repository => (
              <Repository
                containerWidth={repositoryWidth}
                key={`repository-${repository.name}`}
                repository={repository}
              />
            ))}
          </Grid>
        )}
      </div>
    );
  }
}

Github.propTypes = {
  classes: PropTypes.object.isRequired,
  apiFetch: PropTypes.object.isRequired
};

export default withStyles(styles)(
  connect(props => ({
    apiFetch: {
      method: 'GET',
      mode: 'cors',
      url: GITHUB_STATS_URL,
      refreshInterval: 5000
    }
  }))(Github)
);
