import React from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { darkTheme } from './themes';
import DashboardGrid from './DashboardGrid';
import './App_dark.css';

const App = () => (
  <MuiThemeProvider theme={darkTheme}>
    <DashboardGrid />
  </MuiThemeProvider>
);

export default App;
