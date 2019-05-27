import React from 'react';
import bytes from 'bytes';
import PropTypes from 'prop-types';
import withWidth from '@material-ui/core/withWidth';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {
  History,
  GitPullRequest,
  Star,
  IssueOpened,
  IssueClosed,
  GitMerge,
  Database
} from '@githubprimer/octicons-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import moment from 'moment';
import Table from 'app/components/Table';
import TableHeader from 'app/components/Table/Header';
import TableBody from 'app/components/Table/Body';
import TableColumn from 'app/components/Table/Column';
import Stats from 'app/components/Github/Stats';

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
  container: {
    padding: 'var(--container-padding)',
    whiteSpace: 'pre'
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
  values: {
    height: '75%',
    flexFlow: 'column'
  },
  valuesLeft: {
    paddingRight: '5px'
  },
  valuesRight: {
    borderLeft: '1px solid rgba(255, 255, 255, 0.10)',
    paddingLeft: '5px'
  }
});

const Repository = props => {
  const {
    classes,
    width,
    repository: {
      name,
      commits,
      issues_open,
      pull_requests_open,
      stars,
      issues_closed,
      pull_requests_merged,
      disk_usage,
      updated_at
    }
  } = props;
  const formattedName = name.replace('webkom/', '').replace('lego-', '');
  const isLarge = width !== undefined && ['lg', 'xl'].includes(width);
  const statsItems = [
    {
      name: 'Commits',
      icon: History,
      value: Number(commits).toLocaleString('en')
    },
    {
      name: 'PRs',
      icon: GitPullRequest,
      value: Number(pull_requests_open).toLocaleString('en')
    },
    {
      name: 'Stars',
      icon: Star,
      value: Number(stars).toLocaleString('en')
    }
  ];
  const extraStatsItems = [
    {
      name: 'Merged PRs',
      icon: GitMerge,
      value: Number(pull_requests_merged).toLocaleString('en')
    },
    {
      name: 'Diskforbruk',
      icon: Database,
      value: bytes(disk_usage * 1024)
    },
    {
      name: 'Siste Push',
      icon: History,
      value: moment(updated_at).format('YYYY-MM-DD')
    }
  ];
  if (formattedName !== 'webapp') {
    statsItems.push({
      name: 'Issues',
      icon: IssueOpened,
      value: Number(issues_open).toLocaleString('en')
    });
    extraStatsItems.push({
      name: 'Lukkede Issues',
      icon: IssueClosed,
      value: Number(issues_closed).toLocaleString('en')
    });
  }
  const maxItems = 4;
  const statsHeight = 100 / maxItems;
  return (
    <Table xs={6}>
      <TableHeader height={statsHeight}>
        <FontAwesomeIcon className={classes.githubIcon} icon={faGithub} />
        <span>{formattedName}</span>
      </TableHeader>
      <TableBody>
        {!isLarge ? (
          <TableColumn>
            {statsItems.map(({ name, icon, value }) => (
              <Stats
                key={`github-stats-${name}`}
                height={statsHeight}
                name={name}
                icon={icon}
                value={value}
              />
            ))}
          </TableColumn>
        ) : (
          <Grid item container>
            <TableColumn xs={6} leftColumn>
              {statsItems.map(({ name, icon, value }) => (
                <Stats
                  key={`github-stats-${name}`}
                  height={statsHeight}
                  name={name}
                  icon={icon}
                  value={value}
                />
              ))}
            </TableColumn>
            <TableColumn xs={6} rightColumn>
              {extraStatsItems.map(({ name, icon, value }) => (
                <Stats
                  key={`github-stats-${name}`}
                  height={statsHeight}
                  name={name}
                  icon={icon}
                  value={value}
                />
              ))}
            </TableColumn>
          </Grid>
        )}
      </TableBody>
    </Table>
  );
};

Repository.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  repository: PropTypes.object.isRequired
};

Repository.defaultProps = {
  rightAlign: false
};

export default withWidth()(withStyles(styles)(Repository));
