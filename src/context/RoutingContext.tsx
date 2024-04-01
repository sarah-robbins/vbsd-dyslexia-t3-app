import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface RoutingContextType {
  currentRoute: string;
  setRoute: (newRoute: string) => void;
}

const RoutingContext = createContext<RoutingContextType | undefined>(undefined);

export const RoutingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const defaultRoute = !session ? "meetings" : session?.user.view;
  const localStorageKey = "currentRoute";

  const [currentRoute, setCurrentRoute] = useState(defaultRoute);

  useEffect(() => {
    const routeFromStorage = localStorage.getItem(localStorageKey);
    if (routeFromStorage) {
      setCurrentRoute(routeFromStorage);
    }
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    const roles =
      session.user.role
        ?.toLowerCase()
        .split(",")
        .map((role) => role.trim()) || [];
    const view = session.user.view?.toLowerCase();

    const updateViewBasedOnUserView = () => {
      if (view === "meetings" && roles.includes("tutor")) {
        return "meetings";
      } else if (
        view === "students" &&
        (roles.includes("principal") || roles.includes("admin"))
      ) {
        return "students";
      } else if (view === "users" && roles.includes("admin")) {
        return "users";
      } else {
        return "meetings";
      }
    };

    const newView = updateViewBasedOnUserView();

    if (newView !== currentRoute) {
      setRoute(newView);
    }
  }, [session?.user.role, session?.user.view]);

  const setRoute = (newRoute: string) => {
    setCurrentRoute(newRoute);
    localStorage.setItem("currentRoute", newRoute);
  };

  return (
    <RoutingContext.Provider value={{ currentRoute, setRoute }}>
      {children}
    </RoutingContext.Provider>
  );
};

// Custom hook for easy context consumption
export const useRouting = () => {
  const context = useContext(RoutingContext);
  if (context === undefined) {
    throw new Error("useRouting must be used within a RoutingProvider");
  }
  return context;
};
