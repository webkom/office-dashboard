import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect, PromiseState } from 'react-refetch';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import withWidth from '@material-ui/core/withWidth';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import * as moment from 'moment';
import 'moment-with-locales-es6';
import 'moment/locale/nb';
import 'moment-duration-format';
import { PRESENCE_URL, BRUS_URL } from './config';
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
    opacity: 0.5,
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
    const { presenceFetch, brusFetch } = this.props;
    const { isLoading, members, lastDatetime } = this.state;

    const allFetches = PromiseState.all([presenceFetch, brusFetch]);

    if (!isLoading && allFetches.pending) {
      this.setState({ isLoading: true });
    } else if (isLoading && allFetches.rejected) {
      throw allFetches.reason.message;
    } else if (allFetches.fulfilled) {
      const [presence, brus] = allFetches.value;
      presence.members.map(member => {
        const brusInfo = brus.find(
          brusMember => brusMember.name === member.brus
        );
        if (typeof brusInfo === 'undefined') {
          member['brus_data'] = {
            balance: '?',
            soda_bottles_bought: '?',
            soda_cans_bought: '?'
          };
        } else {
          member['brus_data'] = brusInfo;
        }
        return member;
      });

      if (
        lastDatetime !== presence.last_datetime ||
        members !== presence.members
      ) {
        this.setState({
          lastDatetime: presence.last_datetime,
          members: presence.members,
          isLoading: false
        });
      }
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
  brusFetch: PropTypes.object.isRequired,
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
      },
      brusFetch: {
        method: 'GET',
        mode: 'cors',
        url: `${BRUS_URL}/api/liste/`,
        refreshInterval: 60000
      }
    }))(DashboardContent)
  )
);
