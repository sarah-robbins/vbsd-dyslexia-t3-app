import React, { useState, useEffect } from 'react';
// import styles from './index.module.css';
// import { signIn, signOut, useSession } from 'next-auth/react';
import { type NextPage } from 'next';
import Head from 'next/head';
// import { api } from '@/utils/api';
// import SplashSpeedDial from '@/components/SplashSpeedDial/SplashSpeedDial';
import { useSession } from 'next-auth/react';
import LoginButton from '@/components/LoginButton/LoginButton';
import { api } from '@/utils/api';
import { type AppSettings } from '@/types';

const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const { data: sessionData } = useSession();
  const getAppSettings = api.settings.getAllSettings.useQuery();
  const [settings, setSettings] = useState<AppSettings[] | undefined>([]);

  useEffect(() => {
    // if (!getAppSettings.data) return;
    setSettings(getAppSettings.data);
    console.log('settings: ', settings);
    console.log('getAppSettings.data: ', getAppSettings.data);
    console.log('getAppSettings.error: ', getAppSettings.error);
    console.log('getAppSettings.status: ', getAppSettings.status);
    console.log('getAppSettings.isLoading: ', getAppSettings.isLoading);
    console.log('getAppSettings.isSuccess: ', getAppSettings.isSuccess);
    console.log('getAppSettings.isError: ', getAppSettings.isError);
  }, [getAppSettings]);

  useEffect(() => {
    if (settings) {
      // Convert the settings object to a string
      const settingsStr = JSON.stringify(settings);
      // Save to session storage
      sessionStorage.setItem('settings', settingsStr);
    }
  }, [settings]);

  console.log('sessionData', sessionData);
  console.log('getAppSettings', getAppSettings);
  console.log('settings', settings);

  return (
    <>
      <Head>
        <title>Dyslexia App | VBSD</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex w-full min-h-screen flex-column justify-content-center align-items-center p-8 text-center ">
        <div className="flex flex-column justify-content-center align-items-center flex-wrap gap-5">
          <div>
            <h1>
              Dyslexia <br /> Dashboard
            </h1>
            <p>version 0.1.0</p>
          </div>
          <div>
            {/* <SplashSpeedDial /> */}
            <LoginButton />
          </div>

          {/* <div className={styles.showcaseContainer}>
            <p className={styles.showcaseText}>
              {hello.data ? hello.data.greeting : "Loading tRPC query..."}
            </p>
            <AuthShowcase />
          </div> */}
        </div>
      </main>
    </>
  );
};

// function AuthShowcase() {
//   const { data: sessionData } = useSession();

//   const { data: secretMessage } = api.example.getSecretMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined },
//   );

//   return (
//     <div className={styles.authContainer}>
//       <p className={styles.showcaseText}>
//         {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
//         {secretMessage && <span> - {secretMessage}</span>}
//       </p>
//       <button
//         className={styles.loginButton}
//         onClick={sessionData ? () => void signOut() : () => void signIn()}
//       >
//         {sessionData ? "Sign out" : "Sign in"}
//       </button>
//     </div>
//   );
// }

export default Home;
