import React from 'react';
import PropTypes from 'prop-types';
import withWidth from '@material-ui/core/withWidth';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Octicon, {
  History,
  GitPullRequest,
  Star,
  IssueOpened
} from '@githubprimer/octicons-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const styles = theme => ({
  leftAlign: {
    textAlign: 'left'
  },
  rightAlign: {
    textAlign: 'right'
  },
  githubIcon: {
    color: theme.palette.secondary.dark,
    paddingRight: '4px'
  },
  counterIcon: {
    display: 'flow-root',
    color: theme.palette.secondary.main,
    opacity: 0.8,
    paddingRight: '4px'
  },
  container: {
    padding: 'var(--container-padding)',
    whiteSpace: 'pre',
    width: 'var(--container-width)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '25%',
    letterSpacing: '4px',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    borderBottom: '1px solid rgba(255, 255, 255, 0.10)'
  },
  counters: {
    height: '75%',
    flexFlow: 'column'
  },
  counterContainer: {
    width: '100%',
    height: 'var(--counter-container-height)',
    fontSize: '0.85rem'
  },
  counterContainerLeft: {
    width: '60%',
    textAlign: 'left'
  },
  counterContainerRight: {
    width: '40%',
    textAlign: 'right'
  },
  counterText: {
    opacity: 0.7
  },
  counterValue: {
    fontFamily: 'monospace',
    opacity: 0.7
  }
});

const GithubRepository = props => {
  const {
    classes,
    width,
    repository: { name, commits, issues_open, pull_requests_open, stars }
  } = props;
  const formattedName = name.replace('webkom/', '').replace('lego-', '');
  const isLarge = width !== undefined && ['lg', 'xl'].includes(width);
  const counterItems = [
    {
      name: 'Commits',
      icon: History,
      value: commits
    },
    {
      name: 'PR',
      icon: GitPullRequest,
      value: pull_requests_open
    },
    {
      name: 'Stars',
      icon: Star,
      value: stars
    }
  ];
  if (formattedName !== 'webapp') {
    counterItems.push({
      name: 'Issues',
      icon: IssueOpened,
      value: issues_open
    });
  }
  const maxItems = 4;
  return (
    <Grid
      item
      container
      className={classes.container}
      style={{
        '--container-width': isLarge ? '10vw' : '100%',
        '--container-padding': isLarge ? '0px 8px' : '0px 6px'
      }}
    >
      <Grid item className={classes.header}>
        <FontAwesomeIcon className={classes.githubIcon} icon={faGithub} />
        <span>{formattedName}</span>
      </Grid>
      <Grid item container className={classes.counters}>
        {counterItems.map(({ name, icon, value }) => (
          <Grid
            item
            container
            className={classes.counterContainer}
            key={`github-stats-${name}`}
            style={{
              '--counter-container-height': `${100 / maxItems}%`
            }}
          >
            <Grid item className={classes.counterContainerLeft}>
              <Octicon className={classes.counterIcon} icon={icon} />
              {true && <span className={classes.counterText}>{name}:</span>}
            </Grid>
            <Grid item className={classes.counterContainerRight}>
              <span className={classes.counterValue}>
                {Number(value).toLocaleString('en')}
              </span>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

GithubRepository.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  repository: PropTypes.object.isRequired
};

GithubRepository.defaultProps = {
  rightAlign: false
};

export default withWidth()(withStyles(styles)(GithubRepository));
