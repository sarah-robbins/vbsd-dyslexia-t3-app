import * as React from 'react';
import Image from 'next/image';
import {
  styled,
  useTheme,
  type Theme,
  type CSSObject,
} from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, {
  type AppBarProps as MuiAppBarProps,
} from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import SettingsIcon from '@mui/icons-material/Settings';
import { routingContext } from '@/context/AllContext';
import router from 'next/router';

const drawerWidth = 180;

interface Link {
  text: string;
  link: string;
  icon: string;
}

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // ...(open && {}),
}));

const MiniDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

const LeftSideNav = (props: unknown) => {
  console.log('props: ', props);
  // const theme = useTheme();
  const { setRouting } = React.useContext(routingContext);
  const [open, setOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const settings = ['Profile'];

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const links: Link[] = [
    {
      text: 'Meetings',
      link: '/meetings',
      icon: 'MeetingsIcon',
    },
    // {
    //   text: 'Students',
    //   link: '/students',
    //   icon: 'StudentsIcon',
    // },
    {
      text: 'Users',
      link: '/users',
      icon: 'UsersIcon',
    },
    // {
    //   text: 'Stats',
    //   link: '/stats',
    //   icon: 'StatsIcon',
    // },
    // {
    //   text: 'Settings',
    //   link: '/settings',
    //   icon: 'SettingsIcon',
    // },
  ];

  const iconMap = {
    MeetingsIcon: EventIcon,
    UsersIcon: PeopleIcon,
    StudentsIcon: GroupsIcon,
    StatsIcon: LeaderboardIcon,
    SettingsIcon: SettingsIcon,
  };

  // const theme = useTheme();
  // const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));

  const drawer = (
    <div>
      <DrawerHeader></DrawerHeader>
      <Divider />
      <div className="w-12 h-3rem no-wrap justify-content-between align-items-center hidden md:flex ">
        {!open ? (
          ''
        ) : (
          <Typography variant="h6" noWrap component="div" className="px-4">
            Menu
          </Typography>
        )}
        {/* <h3 className='px-4 py-2'>Menu</h3> */}
        <IconButton
          onClick={handleDrawerToggle}
          className="mobile-menu-toggle py-2">
          {!open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </div>
      <Divider />
      <List>
        {links.map((link) => (
          <ListItem key={link.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={() => setRouting(link.text.toLowerCase())}
              sx={{
                minHeight: 48,
                justifyContent: 'initial',
                px: 2.5,
              }}>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}>
                {React.createElement(
                  iconMap[link.icon as keyof typeof iconMap]
                )}
              </ListItemIcon>
              <ListItemText
                primary={link.text}
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
  const { window } = props;
  console.log('props 2: ', props);

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar className="flex justify-content-between">
          <div className="flex align-items-center">
            <IconButton
              onClick={handleDrawerToggle}
              className="md:hidden text-white p-0 mr-4">
              {!open ? <MenuIcon /> : <CloseIcon />}
            </IconButton>

            <Image
              src="/logo.svg"
              width={36}
              height={36}
              alt="Dyslexia Dashboard Logo"
              className="mr-4"
            />
            <div>
              <Typography
                variant="h6"
                noWrap
                component="div"
                className=" hidden md:flex">
                <Box sx={{ lineHeight: '1' }} className="mb-1">
                  Dyslexia Dashboard
                </Box>
              </Typography>
              <Typography variant="subtitle2" component="div">
                <Box sx={{ lineHeight: '1' }}>Van Buren School District</Box>
              </Typography>
            </div>
          </div>
          <Box
            sx={{ flexGrow: 0 }}
            className="flex text-white align-items-center">
            {/* <p className='mr-2'>Full Name</p>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip> */}
            <div className="text-right mr-2 hidden md:flex flex-column">
              <Typography variant="h6" noWrap component="div">
                <Box sx={{ lineHeight: '1' }} className="mb-1">
                  Full Name
                </Box>
              </Typography>
              <Typography variant="subtitle2" noWrap component="div">
                <Box sx={{ lineHeight: '1' }}>Tutor</Box>
              </Typography>
            </div>
            <Tooltip title="Open settings">
              <Button
                variant="contained"
                disableElevation
                color="primary"
                onClick={handleOpenUserMenu}
                sx={{ p: 1 }}
                className="user-button">
                <Avatar
                  alt="Full Name"
                  src="/"
                  className="navbar-avatar ml-2 mr-2"
                  variant="rounded"
                />
                <ArrowDropDownIcon />
              </Button>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}>
              {settings.map((setting) => (
                <MenuItem key={setting} disabled onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
              <MenuItem onClick={() => router.push('/')}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        container={container}
        variant="temporary"
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}>
        {drawer}
      </Drawer>
      <MiniDrawer
        variant="permanent"
        open={open}
        sx={{
          display: { xs: 'none', md: 'flex' },
        }}>
        {drawer}
      </MiniDrawer>
    </>
  );
};

export default LeftSideNav;
