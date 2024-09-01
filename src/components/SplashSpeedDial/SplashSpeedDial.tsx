import React, { useRef } from 'react';
import styles from './SplashSpeedDial.module.css';
import { SpeedDial } from 'primereact/speeddial';
import { Toast } from 'primereact/toast';
import { type MenuItem } from 'primereact/menuitem';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

export default function SplashSpeedDial() {
  // const { data: session } = useSession();
  const redBgClass = styles?.topRightIconRedBg ?? '';
  const greenBgClass = styles?.topRightIconGreenBg ?? '';
  const topRightIconClass = styles?.topRightIcon ?? '';
  const updateDetected = false;
  const updateStatus = () => {
    if (updateDetected) {
      return (
        <div className={`${redBgClass} absolute z-5`}>
          <i
            className={`${topRightIconClass} exclamation-icon pi pi-exclamation-circle`}
            style={{ color: 'white' }}></i>
        </div>
      );
    }
    return (
      <div className={`${greenBgClass} absolute z-5`}>
        <i
          className={`${topRightIconClass} exclamation-icon pi pi-check-circle`}
          style={{ color: 'white' }}></i>
      </div>
    );
  };

  const toast = useRef<Toast>(null);
  const items: MenuItem[] = [
    {
      label: 'Add',
      icon: 'pi pi-video',
      command: () => {
        window.open('https://app.whizzimo.com/#/login', '_blank');
      },
    },
    {
      label: 'Update',
      icon: 'pi pi-refresh',
      command: () => {
        toast.current?.show({
          severity: 'success',
          summary: 'Update',
          detail: 'Data Updated',
        });
      },
    },
    // TODO: wait to go to callbackUrl until user is logged in and state is set.
    {
      label: 'Login',
      icon: 'pi pi-external-link',
      command: () => {
        void signIn('google', { callbackUrl: '/dashboard' });
      },
    },
  ];

  return (
    <div className="logo-speeddial card p-card-grey p-overlay-badge shadow-5 border-round-lg p-3 background-primary">
      <div style={{ position: 'relative' }}>
        <Toast ref={toast} />
        <SpeedDial
          model={items}
          radius={140}
          type="semi-circle"
          direction="down"
          showIcon={
            <Image
              src="/logo.svg"
              width={150}
              height={150}
              alt="dropdown icon"
            />
          }
          hideIcon={
            <Image
              src="/logo.svg"
              width={150}
              height={150}
              alt="dropdown icon"
            />
          }
          className="p-overlay-badge"
        />
      </div>
      {updateStatus()}
    </div>
  );
}
