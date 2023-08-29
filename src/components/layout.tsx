import TopNav from './TopNav'
import SideNav from './SideNav(old)'
 
export default function Layout({ children }) {
  return (
    <>
      <TopNav />
      <div className='flex div-container-class'>
        <SideNav className='flex-grow-0' />
        <main className='flex-grow-1'>
          <div className='testclass'>test</div>{children}</main>
      </div>
    </>
  )
}