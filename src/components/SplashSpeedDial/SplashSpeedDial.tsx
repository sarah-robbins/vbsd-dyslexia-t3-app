import React, { useRef } from 'react';
import styles from './SplashSpeedDial.module.css';
import { SpeedDial } from 'primereact/speeddial';
import { Toast } from 'primereact/toast';
import { type MenuItem } from 'primereact/menuitem';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function SplashSpeedDial() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const items: MenuItem[] = [
    {
      label: 'Add',
      icon: 'pi pi-video',
      command: () => {
        // add link to https://app.whizzimo.com/#/login
        window.open('https://app.whizzimo.com/#/login', '_blank');
      },
    },
    {
      label: 'Update',
      icon: 'pi pi-refresh',
      command: () => {
        toast.current.show({
          severity: 'success',
          summary: 'Update',
          detail: 'Data Updated',
        });
      },
    },
    {
      label: 'Login',
      icon: 'pi pi-external-link',
      command: () => {
        router.push('/dashboard');
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
          showIcon={<img alt="dropdown icon" src="/logo.svg" />}
          hideIcon={<img alt="dropdown icon" src="/logo.svg" />}
          className="p-overlay-badge"
        />
      </div>

      <div className={`${styles.topRightIconRedBg} absolute z-5`}>
        <i
          className={`${styles.topRightIcon} exclamation-icon pi pi-exclamation-circle`}
          style={{ color: 'white' }}></i>
      </div>

      {/* <div className={`${styles.topRightIconGreenBg} absolute z-5`}>
        <i className={`${styles.topRightIcon} exclamation-icon pi pi-check-circle`} style={{ color: 'white' }}></i>
      </div> */}
    </div>
  );
}
