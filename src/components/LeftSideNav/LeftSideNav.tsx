import * as React from "react";
import Image from "next/image";
import { styled, type Theme, type CSSObject } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, {
  type AppBarProps as MuiAppBarProps,
} from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import SettingsIcon from "@mui/icons-material/Settings";
import { useRouting } from "@/context/RoutingContext";
import { signOut, useSession } from "next-auth/react";
import { TextField } from "@mui/material";
import Link from "next/link";
import { api } from "@/utils/api";
import { useMemo } from "react";

const drawerWidth = 180;

interface Link {
  text: string;
  link: string;
  icon: string;
}

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

interface LeftSideNavProps {
  window?: (Window & typeof globalThis) | undefined;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const MiniDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const LeftSideNav: React.FC<LeftSideNavProps> = ({ window }) => {
  const { data: session } = useSession();
  const { currentRoute, setRoute } = useRouting();

  const [open, setOpen] = React.useState(false);
  const drawerRef = React.useRef<HTMLDivElement>(null);

  const links: Link[] = [
    {
      text: "Meetings",
      link: "/meetings",
      icon: "MeetingsIcon",
    },
    {
      text: "Students",
      link: "/students",
      icon: "StudentsIcon",
    },
    {
      text: "Users",
      link: "/users",
      icon: "UsersIcon",
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

  const roles =
    session?.user?.role?.split(",").map((role) => role.trim()) || [];
  const filteredLinks = useMemo(() => {
    if (session?.user.role === "Tutor") {
      return links.filter(
        (link) => link.text !== "Users" && link.text !== "Students"
      );
    }
    if (session?.user.role === "Principal" || session?.user.role === "Admin") {
      return links.filter(
        (link) => link.text !== "Meetings" && link.text !== "Users"
      );
    }
    if (roles.includes("Principal") && !roles.includes("Admin")) {
      return links.filter((link) => link.text !== "Users");
    }
    return links;
  }, [links, session?.user.role]);

  // React.useEffect(() => {
  //   const storedView = localStorage.getItem("currentRoute");
  //   console.log("storedView", storedView);
  //   if (storedView && setRoute) {
  //     setRoute(storedView);
  //   }
  //   console.log("local storeage", localStorage.getItem("currentRoute"));
  // }, [setRoute]);

  const setNewRoute = (link: Link) => {
    const newRoute = link.text.toLowerCase();
    setRoute(newRoute); // Update the context and localStorage
    setOpen(false); // Close the drawer if open
  };

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  const [phone, setPhone] = React.useState<string>(session?.user.phone || "");

  const updateUserMutation = api.users.updateUser.useMutation();

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const numbers = inputValue.replace(/\D/g, "");
    let phone = "";
    for (let i = 0; i < numbers.length; i++) {
      if (i === 3 || i === 6) {
        phone += "-";
      }
      phone += numbers[i];
    }
    phone = phone.substring(0, 12);
    setPhone(phone);
  };

  const handleSavePhone = () => {
    if (session && session.user.userId) {
      const userId = Number(session.user.userId);
      if (!isNaN(userId)) {
        updateUserMutation.mutate({
          id: userId,
          phone: phone,
        });
      } else {
        console.error("Invalid user ID");
      }
    }
  };

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  function capitalizeEachWord(string: string): string {
    return string
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const drawer = (
    <div
      className="flex flex-column justify-content-between"
      style={{ height: "100%" }}
    >
      <div>
        <DrawerHeader></DrawerHeader>
        <Divider />
        <div className="w-12 h-3rem no-wrap justify-content-between align-items-center hidden md:flex ">
          {!open ? (
            ""
          ) : (
            <Typography variant="h6" noWrap component="div" className="px-4">
              Menu
            </Typography>
          )}
          {/* <h3 className='px-4 py-2'>Menu</h3> */}
          <IconButton
            onClick={handleDrawerToggle}
            className="mobile-menu-toggle py-2"
          >
            {!open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>
          {filteredLinks.map((link) => (
            <ListItem key={link.text} disablePadding sx={{ display: "block" }}>
              <ListItemButton onClick={() => setNewRoute(link)}>
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
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
      <div className="tutorial-icon">
        <Link
          href="https://google.com"
          className="flex align-items-center
          justify-content-center"
          style={{ width: "100%" }}
        >
          <IconButton aria-label="Tutorial" disabled>
            <LightbulbIcon />
          </IconButton>
        </Link>
      </div>
    </div>
  );
  const container =
    window && window.document ? () => window.document.body : undefined;

  const userProfile = (
    <div className="flex flex-column justify-content-center align-items-center gap-3">
      <TextField
        value={session ? session.user.phone : ""}
        onChange={handlePhoneChange}
        label="Phone Number"
        className="w-12"
      />
      <TextField
        value={session ? session.user.email : ""}
        disabled
        label="Email"
        className="w-12"
      />
      <div className="profile-btns flex align-items-start gap-2 w-full">
        <Button variant="contained" color="primary" onClick={handleSavePhone}>
          Save
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            void signOut({ callbackUrl: "/" });
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar className="flex justify-content-between">
          <div className="flex align-items-center">
            <IconButton
              onClick={handleDrawerToggle}
              className="md:hidden text-white p-0 mr-4"
            >
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
                className=" hidden md:flex"
              >
                <Box sx={{ lineHeight: "1" }} className="mb-1">
                  Dyslexia Dashboard
                </Box>
              </Typography>
              <Typography variant="subtitle2" component="div">
                <Box sx={{ lineHeight: "1" }}>Van Buren School District</Box>
              </Typography>
            </div>
          </div>
          <Box
            sx={{ flexGrow: 0 }}
            className="flex text-white align-items-center"
          >
            <div className="text-right mr-2 hidden md:flex flex-column">
              <Typography variant="h6" noWrap component="div">
                <Box sx={{ lineHeight: "1" }} className="mb-1">
                  {session ? session.user.name : ""}
                </Box>
              </Typography>
              <Typography variant="subtitle2" noWrap component="div">
                <Box sx={{ lineHeight: "1" }}>
                  {capitalizeEachWord(session ? session.user.role : "")}
                </Box>
              </Typography>
            </div>
            <Tooltip title="Open settings">
              <Button
                variant="contained"
                disableElevation
                color="primary"
                onClick={handleOpenUserMenu}
                sx={{ p: 1 }}
                className="user-button"
              >
                <Avatar
                  alt={session ? (session.user.name as string) : ""}
                  src="/"
                  className="navbar-avatar ml-2 mr-2"
                  variant="rounded"
                />
                <ArrowDropDownIcon />
              </Button>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <div className="user-profile-dropdown">{userProfile}</div>
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
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      <MiniDrawer
        ref={drawerRef}
        variant="permanent"
        open={open}
        sx={{
          display: { xs: "none", md: "flex" },
        }}
      >
        {drawer}
      </MiniDrawer>
    </>
  );
};

export default LeftSideNav;
