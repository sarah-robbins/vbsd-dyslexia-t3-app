// @ts-nocheck

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { useEventListener } from 'primereact/hooks';
import { Menu } from 'primereact/menu';

const sidebarNavLinks = [
  {
    label: 'Dashboard',
    icon: 'pi pi-fw pi-file',
  },
  {
    label: 'Delete',
    icon: 'pi pi-fw pi-trash',
  },
  {
    separator: true,
  },
  {
    label: 'Export',
    icon: 'pi pi-fw pi-external-link',
  },
];
const SideNav = () => {
  // const [visible, setVisible] = useState<boolean>(false);
  // const hoverOnSidebar = console.log('Hovered on Sidebar!')
  // const hoverOnSidebar = () => {
  //   const menu = document.getElementById('testId')
  //   menu.classList.remove('menu-mini')
  //   menu.classList.add('menu-standard')
  // }
  // const exitHover = () => {
  //   const menu = document.getElementById('testId')
  //   menu.classList.remove('menu-standard')
  //   menu.classList.add('menu-mini')
  // }

  const [hover, setHover] = useState<boolean>(false);
  const elementRef = useRef<string>(null);
  const toggleHoverClass = () => {
    setHover(!hover);
  };
  const [bindMouseEnterListener, unbindMouseEnterListener] = useEventListener({
    target: elementRef,
    type: 'mouseenter',
    listener: () => {
      setHover(true);
      toggleHoverClass;
    },
  });

  const [bindMouseLeaveListener, unbindMouseLeaveListener] = useEventListener({
    target: elementRef,
    type: 'mouseleave',
    listener: () => {
      setHover(false);
      toggleHoverClass;
    },
  });

  useEffect(() => {
    bindMouseEnterListener();
    bindMouseLeaveListener();

    return () => {
      unbindMouseEnterListener();
      unbindMouseLeaveListener();
    };
  }, [
    bindMouseEnterListener,
    bindMouseLeaveListener,
    unbindMouseEnterListener,
    unbindMouseLeaveListener,
  ]);

  return (
    <div className="card flex justify-content-center">
      <Sidebar
        visible={true}
        onHide={() => false}
        modal={false}
        id="testId"
        className={`${
          hover ? 'menu-standard' : 'menu-mini'
        } menu-wrapper h-full`}>
        <div ref={elementRef} className="p-3">
          {hover ? hover : !hover}
          <i className="pi pi-bars pb-2" />
          <Menu model={sidebarNavLinks} className="m-0 p-0" />
        </div>
      </Sidebar>
      {/* <Button icon="pi pi-arrow-right" onClick={() => hoverOnSidebar()} />
        <div ref={elementRef} className="border-round border-2 border-dashed surface-border text-xl p-5 w-15rem text-center">
          {hover}
        </div> */}
    </div>
  );
};

export default SideNav;
