import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { type AppType } from 'next/app';
import { api } from '@/utils/api';
import '@/styles/globals.css';
import '@/styles/primeflex.scss';
// PrimeReact theme
import 'primereact/resources/themes/lara-light-blue/theme.css';
// PrimeReact core
import 'primereact/resources/primereact.min.css';
// PrimeFlex
import '/node_modules/primeflex/primeflex.css';
// PrimeIcons
import 'primeicons/primeicons.css';
import React from 'react';
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles';
import darkTheme from './themes/darkTheme';
import lightTheme from './themes/lightTheme';
import { routingContext } from '@/context/AllContext';

const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [routing, setRouting] = React.useState<string>('');
  const [mode, setMode] = React.useState<'light' | 'dark'>('dark');
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const darkThemeChosen = React.useMemo(
    () =>
      createTheme({
        ...darkTheme,
      }),
    [mode]
  );
  const lightThemeChosen = React.useMemo(
    () =>
      createTheme({
        ...lightTheme,
      }),
    [mode]
  );

  return (
    <React.StrictMode>
      \{' '}
      <ColorModeContext.Provider value={colorMode}>
        <MuiThemeProvider
          theme={mode === 'light' ? darkThemeChosen : lightThemeChosen}>
          <SessionProvider session={session}>
            <routingContext.Provider value={{ routing, setRouting }}>
              <Component {...pageProps} />
            </routingContext.Provider>
          </SessionProvider>
        </MuiThemeProvider>
      </ColorModeContext.Provider>
    </React.StrictMode>
  );
};

export default api.withTRPC(MyApp);
