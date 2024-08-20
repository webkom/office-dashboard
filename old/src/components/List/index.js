import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import 'moment/locale/nb';
import 'moment-duration-format';
import * as moment from 'moment';
import Header from 'app/components/List/Header';
import Member from 'app/components/Member';

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

const DashboardList = ({ classes, width, members, lastDatetime }) => (
  <List>
    {width !== undefined && width !== 'xs' && <Header />}
    {members.map(member => (
      <Member key={member.slack} member={member} />
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

DashboardList.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  members: PropTypes.array.isRequired,
  lastDatetime: PropTypes.string.isRequired
};

export default withWidth()(withStyles(styles)(DashboardList));
