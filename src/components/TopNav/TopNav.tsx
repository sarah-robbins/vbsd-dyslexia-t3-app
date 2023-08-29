/* eslint-disable @next/next/no-img-element */
import React, { useRef } from 'react'
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';

const TopNav = () => {
  const start = <div className='flex align-items-center gap-2'>
    <i className='pi pi-bars md:hidden'></i>
    <h2>Dyslexia Dashboard</h2>
    </div>

    const menuRight = useRef(null);

  const profileMenu = [
    {
      template: () => {
        return (
          <>
            <p>Profile Info</p>
          </>
        )
      }
    }
  ]
  
  const end = <div className='flex gap-2'>
    <Menu model={profileMenu} popup ref={menuRight} id="popup_menu_right" popupAlignment="right" />
            <Button className="mr-2 flex gap-2" onClick={(event) => menuRight.current.toggle(event)} aria-controls="popup_menu_right" aria-haspopup >
              <Avatar image="/logo.svg" shape="circle" />
              Name
              <i className='pi pi-angle-down'></i>
            </Button>
  </div>;


  return (
    <div className="card">
      <Menubar start={start} end={end} />
    </div>
  )
}

export default TopNav
