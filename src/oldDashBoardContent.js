import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles  } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import MemberRow from './MemberRow'
import members from './members.json'

const styles = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

// https://github.com/kotlarz.png?size=460

export class DashboardContent extends Component {
    /*
    constructor(props) {
        super(props);
        this.state = { members: members.filter(member => member.active)
            .map(member => {
                member['last_active'] = null;
                return member;
            })
        }
        console.log(members);
    }

    shouldComponentUpdate(nextProps, nextState) {
        console.log('nextProps', nextProps);
        console.log('nextState', nextState);
    }
    */

    render() {
      const { classes } = this.props;
      const { members } = this.state;

      console.log(this.state);

      return (
            <Table>
                <TableBody>
                {members.map(member => (
                    <MemberRow key={member.slack} member={member} />
                ))}
                </TableBody>
            </Table>
      );
    }
}


DashboardContent.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withStyles(styles)(DashboardContent);
