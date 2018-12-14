import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect, PromiseState  } from 'react-refetch'
import { withStyles  } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import { PRESENCE_URL } from './config';
import MemberRow from './MemberRow'
import { presenceConnector } from './presence-connector'
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
    render() {
        // const { classes } = this.props;
        // const { members } = this.state;
        //

        const { presenceFetch } = this.props
        if (presenceFetch.pending) {
            return <CircularProgress/>
        } else if (presenceFetch.rejected) {
            console.log(presenceFetch)
            console.log("ERROR !", presenceFetch.reason)
            return "ERROR"
            // return <Error error={allFetches.reason}/>
        } else if (presenceFetch.fulfilled) {
            // decompose the PromiseState back into individual
            const members = presenceFetch.value
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
}


//DashboardContent.propTypes = {
// classes: PropTypes.object.isRequired,
//};



// export default withStyles(styles)(DashboardContent);


export default connect(props => ({
    presenceFetch: {
        method: "GET",
        mode: "cors",
        url: PRESENCE_URL,
        refreshInterval: 60000
    }
}))(DashboardContent)
