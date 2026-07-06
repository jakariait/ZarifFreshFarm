import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { preloadPublicRoutes, preloadUserRoutes, preloadAdminRoutes } from "../../utils/routePreloader";

let publicPreloaded = false;
let userPreloaded = false;
let adminPreloaded = false;

if (typeof window !== "undefined" && !publicPreloaded) {
  publicPreloaded = true;
  preloadPublicRoutes();
}

export const RoutePreloader = () => {
  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname;
    
    if (!userPreloaded && path.startsWith("/user") && path !== "/user/home") {
      userPreloaded = true;
      preloadUserRoutes();
    }
    
    if (!adminPreloaded && path.startsWith("/admin") && path !== "/admin/login") {
      adminPreloaded = true;
      preloadAdminRoutes();
    }
  }, [location]);
  
  return null;
};
