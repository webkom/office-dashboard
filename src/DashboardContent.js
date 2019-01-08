import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-refetch';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import withWidth from '@material-ui/core/withWidth';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import * as moment from 'moment';
import 'moment-with-locales-es6';
import 'moment/locale/nb';
import 'moment-duration-format';
import { PRESENCE_URL } from './config';
import DashboardListHeader from './DashboardListHeader';
import MemberItem from './MemberItem';

const styles = theme => ({
  tableFooter: {
    textAlign: 'center',
    paddingBottom: 0
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
  footer: {
    justifyContent: 'space-between',
    display: 'flex',
    width: '100%',
    marginBottom: 0,
    padding: '20px 0 0 0',
    fontSize: '0.65rem',
    color: theme.palette.primary.main,
    [theme.breakpoints.down('xs')]: {
      fontSize: '0.45rem'
    }
  }
});

export class DashboardContent extends Component {
  state = {
    isLoading: true,
    lastDatetime: null,
    members: []
  };

  componentDidUpdate(prevProps) {
    const { presenceFetch } = this.props;
    const { isLoading, members, lastDatetime } = this.state;
    if (!isLoading && presenceFetch.pending) {
      this.setState({ isLoading: true });
    } else if (isLoading && presenceFetch.rejected) {
      throw presenceFetch.reason.message;
    } else if (
      presenceFetch.fulfilled &&
      (members !== presenceFetch.value.members ||
        lastDatetime !== presenceFetch.value.last_datetime)
    ) {
      this.setState({
        lastDatetime: presenceFetch.value.last_datetime,
        members: presenceFetch.value.members,
        isLoading: false
      });
    }
  }

  render() {
    const { classes, width } = this.props;
    const { isLoading, members, lastDatetime } = this.state;

    if (isLoading) {
      return <CircularProgress className={classes.loading} size={'12vh'} />;
    }

    return (
      <List>
        {width !== undefined && width !== 'xs' && <DashboardListHeader />}
        {members.map(member => (
          <MemberItem key={member.slack} member={member} />
        ))}
        <ListItem className={classes.footer}>
          <div>
            Data sist lagret{' '}
            {lastDatetime === null
              ? 'Ukjent'
              : moment(lastDatetime)
                  .locale(moment.locale('nb'))
                  .format()}
          </div>
          <div>
            Data sist hentet{' '}
            {moment()
              .locale(moment.locale('nb'))
              .format()}
          </div>
        </ListItem>
      </List>
    );
  }
}

DashboardContent.propTypes = {
  classes: PropTypes.object.isRequired,
  presenceFetch: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired
};

export default withWidth()(
  withStyles(styles)(
    connect(props => ({
      presenceFetch: {
        method: 'GET',
        mode: 'cors',
        url: PRESENCE_URL,
        refreshInterval: 60000
      }
    }))(DashboardContent)
  )
);
