import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect, PromiseState } from 'react-refetch';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
/*
import * as moment from 'moment';
import 'moment-with-locales-es6';
import 'moment/locale/nb';
import 'moment-duration-format';
*/
import { PRESENCE_URL, BRUS_URL, KAFFE_URL } from 'app/config';
import List from 'app/components/List';

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

export class Content extends Component {
  state = {
    isLoading: true,
    lastDatetime: null,
    members: []
  };

  componentDidUpdate(prevProps) {
    const { presenceFetch, brusFetch, kaffeFetch } = this.props;
    const { isLoading, members, lastDatetime } = this.state;

    const allFetches = PromiseState.all([presenceFetch, brusFetch, kaffeFetch]);

    if (!isLoading && allFetches.pending) {
      this.setState({ isLoading: true });
    } else if (isLoading && allFetches.rejected) {
      throw allFetches.reason.message;
    } else if (allFetches.fulfilled) {
      const [presence, brus, kaffe] = allFetches.value;
      presence.members.map(member => {
        // Brus
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

        // Kaffe
        const kaffeInfo = kaffe.members.find(
          kaffeMember => kaffeMember.name === member.name
        );
        if (typeof kaffeInfo === 'undefined') {
          member['kaffe_data'] = {
            jugs_brewed: '?',
            volume_brewed: '?',
            last_brew: '?'
          };
        } else {
          member['kaffe_data'] = kaffeInfo;
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
    const { classes } = this.props;
    const { isLoading, members, lastDatetime } = this.state;

    if (isLoading) {
      return <CircularProgress className={classes.loading} size={'12vh'} />;
    }

    return <List members={members} lastDatetime={lastDatetime} />;
  }
}

Content.propTypes = {
  classes: PropTypes.object.isRequired,
  presenceFetch: PropTypes.object.isRequired,
  brusFetch: PropTypes.object.isRequired,
  kaffeFetch: PropTypes.object.isRequired
};

export default withStyles(styles)(
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
    },
    kaffeFetch: {
      method: 'GET',
      mode: 'cors',
      url: KAFFE_URL,
      refreshInterval: 60000
    }
  }))(Content)
);
