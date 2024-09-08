import * as React from "react";
import Image from "next/image";
import { styled, type Theme, type CSSObject } from "@mui/material/styles";
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
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
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
import { SvgIcon } from "@mui/material";

const drawerWidth = 56; // Adjusted for 24x24 icons with some padding

const closedMixin = (theme: Theme): CSSObject => ({
  width: `${drawerWidth}px`,
  overflowX: "hidden",
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

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...closedMixin(theme),
  "& .MuiDrawer-paper": closedMixin(theme),
}));

interface Link {
  text: string;
  link: string;
  icon: string;
}

const LeftSideNav: React.FC<LeftSideNavProps> = ({ window }) => {
  const { data: session } = useSession();
  const { setRoute } = useRouting();

  // const drawerRef = React.useRef<HTMLDivElement>(null);

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

  React.useEffect(() => {
    const storedView = localStorage.getItem("currentRoute");
    if (storedView && setRoute) {
      setRoute(storedView);
    }
  }, [setRoute]);

  const setNewRoute = (link: Link) => {
    const newRoute = link.text.toLowerCase();
    setRoute(newRoute);
  };

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
    <div className="flex flex-column justify-content-between" style={{ height: "100%" }}>
      <div>
        <DrawerHeader></DrawerHeader>
        <Divider />
        <List>
          {filteredLinks.map((link) => (
            <ListItem key={link.text} disablePadding sx={{ display: "block" }}>
              <Tooltip title={link.text} placement="right">
                <ListItemButton 
                  onClick={() => setNewRoute(link)}
                  sx={{
                    minHeight: 48,
                    justifyContent: "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 0, 
                      mr: "auto",
                      justifyContent: "center",
                    }}
                  >
                    <SvgIcon 
                      component={iconMap[link.icon as keyof typeof iconMap]} 
                      sx={{ fontSize: 24 }}
                    />
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </div>
      <div className="tutorial-icon">
        <Tooltip title="Tutorial" placement="right">
          <Link
            href="https://google.com"
            className="flex align-items-center justify-content-center"
            style={{ width: "100%" }}
          >
            <IconButton 
              aria-label="Tutorial" 
              disabled
              sx={{
                minHeight: 48,
                justifyContent: "center",
                px: 2.5,
              }}
            >
              <SvgIcon component={LightbulbIcon} sx={{ fontSize: 24 }} />
            </IconButton>
          </Link>
        </Tooltip>
      </div>
    </div>
  );

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
      <AppBar position="fixed">
        <Toolbar className="flex justify-content-between">
          <div className="flex align-items-center">
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
      <Drawer variant="permanent">
        {drawer}
      </Drawer>
    </>
  );
};

export default LeftSideNav;
