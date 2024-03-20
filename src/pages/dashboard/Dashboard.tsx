import Box from "@mui/material/Box";
import LeftSideNav from "@/components/LeftSideNav/LeftSideNav";
import Meetings from "@/components/Meetings/Meetings";
import Students from "@/components/Students/Students";
import Users from "@/components/Users/Users";
import Stats from "@/components/Stats/Stats";
import Settings from "@/components/Settings/Settings";
import { useContext, useEffect, useState } from "react";
import { type RoutingContextType, routingContext } from "@/context/AllContext";

const Dashboard = () => {
  const { routing }: RoutingContextType = useContext(routingContext);
  const [currentRoute, setCurrentRoute] = useState("meetings");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Component did mount logic
    setIsMounted(true);

    // Access local storage only in the browser
    const storedRoute =
      typeof window !== "undefined"
        ? localStorage.getItem("currentRoute")
        : null;
    setCurrentRoute(storedRoute || "meetings");
  }, []);

  useEffect(() => {
    if (routing) {
      setCurrentRoute(routing);
      if (typeof window !== "undefined") {
        localStorage.setItem("currentRoute", routing);
      }
    }
  }, [routing]);

  if (!isMounted) {
    // Render nothing or a loader until the component is mounted
    return null;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }} className="mt-7 md:ml-7">
        <LeftSideNav
          window={typeof window !== "undefined" ? window : undefined}
        />
        {currentRoute === "students" && <Students isOnMeetingsPage={false} />}
        {currentRoute === "meetings" && <Meetings />}
        {currentRoute === "users" && <Users />}
        {currentRoute === "stats" && <Stats />}
        {currentRoute === "settings" && <Settings />}
      </Box>
    </Box>
  );
};

export default Dashboard;
