import { type ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    white: {
      main: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    white?: {
      main?: string;
    };
  }
}

const lightTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#4caf50',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#666666',
    },
    warning: {
      main: '#F59E0B',
    },
    // white: {
    //   main: '#ffffff',
    // }
  },
  typography: {
    fontFamily: 'Poppins',
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
    },
  },
  // colorSchemes: {
  //   light: {
  //     color: {
  //       primary: '#ff0000',
  //     },
  //   },
  // },
};

export default lightTheme;
