// import React from 'react';
// import PropTypes from 'prop-types';
// import { withStyles, withTheme } from '@material-ui/core/styles';
// import withWidth from '@material-ui/core/withWidth';
// import AppBar from '@material-ui/core/AppBar';
// import Grid from '@material-ui/core/Grid';
import Clock from "app/components/Clock";
import darkLogo from "/abakus_logo_white_webkom.png";
import "./index.css";
import { Children, PropsWithChildren } from "react";
import Github from "app/components/Github";
import Sensors from "../Sensors";
// //import darkLogoChristmas from 'app/static/abakus_logo_white_webkom_christmas.png';
// import Environment from 'app/components/Environment';
// import MediaInfo from 'app/components/MediaInfo';
// import Github from 'app/components/Github';
// import Clock from 'app/components/Clock';
// import StatusBar from 'app/components/StatusBar';

// const styles = theme => ({
//   toolbar: {
//     flex: '1 1 auto',
//     textAlign: 'center',
//     padding: 20,
//     fontSize: '1rem',
//     [theme.breakpoints.down('sm')]: {
//       fontSize: '0.9rem'
//     }
//   },
//   logo: {
//     height: '50px'
//   },
//   clock: {
//     height: '100%',
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   rightContainer: {
//     overflow: 'hidden'
//   }
// });

const Header = () => {
  // const isMobile = width !== undefined && width === 'xs';
  // const isLarge = width !== undefined && ['lg', 'xl'].includes(width);

  const HeaderCell: React.FC<PropsWithChildren<{ className?: string }>> = ({
    children,
    className,
  }) => (
    <span
      className={`${className} g-flex-row g-flex-justify-center g-flex-align-center g-height-full`}
    >
      {children}
    </span>
  );

  return (
    <div className="header g-flex-row">
      {/* <AppBar position="static"> */}
      {/* {isMobile ? ( */}
      <div className="g-mobile g-flex g-flex-row g-flex-justify-center g-flex-align-center g-p-2">
        <HeaderCell className="g-flex">
          <img alt="Abakus Linjeforening" className="logo" src={darkLogo} />
        </HeaderCell>
      </div>
      <div className="header-cells g-not-mobile g-flex g-flex-row g-flex-justify-evenly g-flex-align-center g-p-2">
        <div className="logo-and-clock g-flex g-flex-row g-flex-justify-start g-flex-align-center">
          <HeaderCell>
            <img alt="Abakus Linjeforening" className="logo" src={darkLogo} />
          </HeaderCell>
          <HeaderCell>
            <Clock />
          </HeaderCell>
        </div>
        <HeaderCell>
          <Github />
        </HeaderCell>
        <HeaderCell>
          <Sensors />
        </HeaderCell>
      </div>
      {/* <Grid container justify={'flex-start'} className={classes.toolbar}>
        <Grid
          item
          container
          xs={isLarge ? 2 : 4}
          justify={'center'}
          alignItems={'center'}
        >
          <img
            alt="Abakus Linjeforening"
            className={classes.logo}
            src={darkLogo}
          />
        </Grid>
        <Grid item container xs={isLarge ? 1 : 2} alignItems={'center'}>
          <Clock />
        </Grid>
        <Grid
          item
          container
          xs={isLarge ? 9 : 6}
          alignItems={'center'}
          justify={'flex-end'}
          className={classes.rightContainer}
        >
          <Grid item container xs={isLarge ? 8 : 8} alignItems={'center'}>
            <Github />
          </Grid>
          <Grid item container xs={isLarge ? 2 : 4} alignItems={'center'}>
            <Environment />
          </Grid>
        </Grid>
      </Grid> */}
      {/* | )} */}
      {/* </AppBar> */}
      {/* <MediaInfo />
      <StatusBar /> */}
    </div>
  );
};

// Header.propTypes = {
//   classes: PropTypes.object.isRequired,
//   theme: PropTypes.object.isRequired,
//   width: PropTypes.string.isRequired
// };

// export default withWidth()(withTheme()(withStyles(styles)(Header)));

export default Header;
