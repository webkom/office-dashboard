import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles  } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { FontAwesomeIcon  } from '@fortawesome/react-fontawesome'
import { faCoffee  } from '@fortawesome/free-solid-svg-icons'
import { faGithub  } from '@fortawesome/free-brands-svg-icons'
import moment from 'moment-with-locales-es6';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  cell: {
    padding: 10
  }
});


const MemberRow = (props) => {
    const { classes, member } = props

    return (
        <TableRow>
            <TableCell className={classes.cell} width="10%">
                <img width={50} src={member.avatar}/>
            </TableCell>
            <TableCell className={classes.cell} width="20%">
                {member.name}
            </TableCell>
            <TableCell className={classes.cell} width="20%">
                <span>
                    <FontAwesomeIcon icon={faGithub}/>
                    <span> </span>
                    <a href={`https://github.com/${member.github}`}>
                        @{member.github}
                    </a>
                </span>
            </TableCell>
            <TableCell className={classes.cell} width="25%">
                Brygget 1 <FontAwesomeIcon icon={faCoffee}/> kanne(r)
            </TableCell>
            <TableCell className={classes.cell} width="25%">
                { member.is_active ?
                    <span>På kontoret!</span>
                :
                    (member.last_seen != null ?
                        <span>{moment(member.last_seen).locale(moment.locale('nb')).fromNow()}</span>
                    :
                        <span>Ukjent</span>
                    )
                }
            </TableCell>
        </TableRow>
    );
}


MemberRow.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withStyles(styles)(MemberRow);
