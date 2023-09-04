import React, { useRef } from 'react';
import styles from './SplashSpeedDial.module.css';
import { SpeedDial } from 'primereact/speeddial';
import { Toast } from 'primereact/toast';
import { type MenuItem } from 'primereact/menuitem';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function SplashSpeedDial() {
  const redBgClass = styles?.topRightIconRedBg ?? '';
  const greenBgClass = styles?.topRightIconGreenBg ?? '';
  const topRightIconClass = styles?.topRightIcon ?? '';
  const updateDetected = true;

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

  const router = useRouter();
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
    {
      label: 'Login',
      icon: 'pi pi-external-link',
      command: () => {
        void router.push('/dashboard');
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
          showIcon={<Image src="/logo.svg" alt="dropdown icon" />}
          hideIcon={<Image src="/logo.svg" alt="dropdown icon" />}
          className="p-overlay-badge"
        />
      </div>
      {updateStatus()}
    </div>
  );
}
