import React, { useState, useEffect } from "react";
import pkg from "@/../package.json";
import { type NextPage } from "next";
import Head from "next/head";
// import SplashSpeedDial from '@/components/SplashSpeedDial/SplashSpeedDial';
// import { useSession } from "next-auth/react";
import LoginButton from "@/components/LoginButton/LoginButton";
import { api } from "@/utils/api";
import { type AppSettings } from "@/types";
import { Card } from "primereact/card";
import VersionBox from "@/components/VersionBox/VersionBox";

const Home: NextPage = () => {
  const version = pkg.version;

  // const { data: sessionData } = useSession();
  const getAppSettings = api.settings.getAllSettings.useQuery();
  const [settings, setSettings] = useState<AppSettings[] | undefined>([]);

  useEffect(() => {
    // if (!getAppSettings.data) return;
    setSettings(getAppSettings.data);
  }, [getAppSettings]);

  useEffect(() => {
    if (settings) {
      // Convert the settings object to a string
      const settingsStr = JSON.stringify(settings);
      // Save to session storage
      sessionStorage.setItem("settings", settingsStr);
    }
  }, [settings]);

  const [appIsUpdated, setAppIsUpdated] = useState<boolean>(true);

  useEffect(() => {
    console.log("version", version.toString());
    const appVersion = "2.0.2 - alpha";
    if (appVersion !== version.toString()) {
      setAppIsUpdated(false);
    }
    console.log("appIsUpdated from index ", appIsUpdated);
  }, [appIsUpdated]);

  return (
    <>
      <Head>
        <title>Dyslexia App | VBSD</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-column justify-content-center align-items-center text-center m-4 sm:m-0">
        <Card>
          <div className="relative-container flex flex-column sm:flex-row flex-wrap gap-4 sm:gap-7 p-6 ">
            {/* Left Side */}
            <div className="flex flex-column  justify-content-between">
              {/* Title */}
              <h1 className="landing-title">
                Dyslexia <br /> Dashboard
              </h1>
              {/* Version Box */}
              <div className="mt-4">
                <VersionBox updateStatus={appIsUpdated} />
              </div>
            </div>
            {/* Line */}
            <div className="divider-line-container flex align-items-stretch">
              <div className="horizontal-line"></div>
              <div className="vertical-line"></div>
            </div>
            {/* Right Side */}
            <div>
              {/* <SplashSpeedDial /> */}
              <LoginButton disabled={!appIsUpdated} />
            </div>
          </div>
        </Card>
      </main>
    </>
  );
};

export default Home;
