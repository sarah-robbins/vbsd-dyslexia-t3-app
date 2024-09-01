// import { type Session } from "next-auth";
import { type customSession } from "@/types";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "@/utils/api";
import "@/styles/globals.css";
import "@/styles/primeflex.scss";
import "@/styles/themes/vb-green/theme.css";
import "primereact/resources/primereact.min.css";
import "/node_modules/primeflex/primeflex.css";
import "primeicons/primeicons.css";
import React from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import darkTheme from "../styles/themes/darkTheme";
import lightTheme from "../styles/themes/lightTheme";
import { RoutingProvider } from "@/context/RoutingContext";

const ColorModeContext = React.createContext({
  toggleColorMode: () => {
    console.log("toggleColorMode");
  },
});

const MyApp: AppType<{ session: customSession | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [mode, setMode] = React.useState<"light" | "dark">("dark");
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const darkThemeChosen = React.useMemo(
    () =>
      createTheme({
        ...darkTheme,
      }),
    []
  );
  const lightThemeChosen = React.useMemo(
    () =>
      createTheme({
        ...lightTheme,
      }),
    []
  );

  return (
    <React.StrictMode>
      <ColorModeContext.Provider value={colorMode}>
        <SessionProvider session={session}>
          <RoutingProvider>
            <MuiThemeProvider
              theme={mode === "light" ? darkThemeChosen : lightThemeChosen}
            >
              <Component {...pageProps} />
            </MuiThemeProvider>
          </RoutingProvider>
        </SessionProvider>
      </ColorModeContext.Provider>
    </React.StrictMode>
  );
};

export default api.withTRPC(MyApp);