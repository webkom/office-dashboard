import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles  } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { library  } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon  } from '@fortawesome/react-fontawesome'
import { faStroopwafel  } from '@fortawesome/free-solid-svg-icons'
import { MuiThemeProvider } from '@material-ui/core/styles';
import { darkTheme } from './themes';
import logo from './logo.svg';
import DashboardGrid from './DashboardGrid';
import './App_dark.css';


const App = () => (
    <MuiThemeProvider theme={darkTheme}>
        <DashboardGrid/>
    </MuiThemeProvider>
)


export default App;
