import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-refetch';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import classNames from 'classnames';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableFooter from '@material-ui/core/TableFooter';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import * as moment from 'moment';
import 'moment-with-locales-es6';
import 'moment/locale/nb';
import 'moment-duration-format';
import { PRESENCE_URL } from './config';
import MemberRow from './MemberRow';

const styles = theme => ({
  tableFooter: {
    textAlign: 'center',
    paddingBottom: 0
  },
  cell: {
    padding: 10,
    textAlign: 'center',
    letterSpacing: 3,
    textTransform: 'uppercase'
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
  footerInfo: {
    marginBottom: 0,
    textAlign: 'center'
  }
});

export class DashboardContent extends Component {
  state = {
    isLoading: true
  };

  componentDidUpdate(prevProps) {
    const { presenceFetch } = this.props;
    if (!this.state.isLoading && presenceFetch.pending) {
      this.setState({ isLoading: true });
    } else if (presenceFetch.rejected) {
      this.props.onError(presenceFetch.reason);
      this.setState({ isLoading: false });
    } else if (
      presenceFetch.fulfilled &&
      this.state.members !== presenceFetch.value
    ) {
      this.setState({
        members: presenceFetch.value,
        isLoading: false
      });
    }
  }

  render() {
    const { classes } = this.props;
    const { isLoading, members } = this.state;

    if (isLoading) {
      return <CircularProgress className={classes.loading} size={'12vh'} />;
    }

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell />
            <TableCell className={classNames(classes.cell, classes.leftAlign)}>
              Github
            </TableCell>
            <TableCell className={classNames(classes.cell, classes.leftAlign)}>
              Antall kanner
            </TableCell>
            <TableCell className={classNames(classes.cell, classes.rightAlign)}>
              Kontortid i dag
            </TableCell>
            <TableCell className={classNames(classes.cell, classes.rightAlign)}>
              Sist sett
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map(member => (
            <MemberRow key={member.slack} member={member} />
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className={classes.tableFooter} colSpan={6}>
              <p className={classes.footerInfo}>
                Data sist hentet{' '}
                {moment()
                  .locale(moment.locale('nb'))
                  .format()}
              </p>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
  }
}

DashboardContent.propTypes = {
  classes: PropTypes.object.isRequired,
  presenceFetch: PropTypes.object.isRequired,
  onError: PropTypes.func.isRequired
};

export default withStyles(styles)(
  connect(props => ({
    presenceFetch: {
      method: 'GET',
      mode: 'cors',
      url: PRESENCE_URL,
      refreshInterval: 30000
    }
  }))(DashboardContent)
);
