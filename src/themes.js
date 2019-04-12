import { createMuiTheme } from '@material-ui/core/styles';

/*
 * Hvit: CMYK(0,0,0,0)
 * Svart: CMYK(0,0,0,95)
 * Lysegrå: CMYK(48,39,42,39) HEX(525251)
 * Grå: CMYK(53,44,46,52) HEX(343434)
 * Lyserød: CMYK(1,98,98,0) — (Fra logo:)(5,100,100,1) HEX(E20D13)
 * Mørkerød: CMYK(20,99,100,13) — (Fra logo:)(18,100,100,9) HEX(BC1818)
 */

export const darkTheme = createMuiTheme({
  props: {
    initialWidth: 'lg'
  },
  typography: {
    fontFamily: [
      // 'Source Sans Pro',
      'Raleway',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(',')
  },
  palette: {
    type: 'dark',
    primary: {
      light: '#474d51',
      main: '#192126',
      dark: '#11171a',
      contrastText: '#fff'
    },
    secondary: {
      light: '#fb3737',
      main: '#fb0506',
      dark: '#af0304',
      darkest: '#8c0502',
      contrastText: '#0D0'
    }
  }
});
