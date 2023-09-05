import Box from '@mui/material/Box';
import LeftSideNav from '@/components/LeftSideNav/LeftSideNav';
import Meetings from '@/components/Meetings/Meetings';
import Students from '@/components/Students/Students';
import Users from '@/components/Users/Users';
import Stats from '@/components/Stats/Stats';
import Settings from '@/components/Settings/Settings';
import { useContext, useEffect, useState } from 'react';
import { type RoutingContextType, routingContext } from '@/context/AllContext';

const Dashboard = () => {
  const { routing }: RoutingContextType = useContext(routingContext);
  // meetings will need to vary based on default View of logged in user in store/session.
  const [currentRoute, setCurrentRoute] = useState<string>('meetings');

  useEffect(() => {
    if (routing) {
      setCurrentRoute(routing);
    }
  }, [routing]);
  return (
    <Box sx={{ display: 'flex' }}>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }} className="mt-7 md:ml-7">
        <LeftSideNav
          window={typeof window !== 'undefined' ? window : undefined}
        />
        {currentRoute === 'students' && <Students />}
        {currentRoute === 'meetings' && <Meetings />}
        {currentRoute === 'users' && <Users />}
        {currentRoute === 'stats' && <Stats />}
        {currentRoute === 'settings' && <Settings />}
      </Box>
    </Box>
  );
};

export default Dashboard;
