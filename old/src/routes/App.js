import React from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { darkTheme } from 'app/themes';
import Dashboard from 'app/components/Dashboard';
import './App_dark.css';

const App = () => (
  <MuiThemeProvider theme={darkTheme}>
    <Dashboard />
  </MuiThemeProvider>
);

export default App;
