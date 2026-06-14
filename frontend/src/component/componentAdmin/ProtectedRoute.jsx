import { Navigate, Outlet } from "react-router-dom";
import useAuthAdminStore from "../../store/AuthAdminStore.js";
import { Suspense } from "react";
import AdminLoading from "../skeleton/AdminLoading.jsx";

const ProtectedRoute = () => {
  const { token } = useAuthAdminStore(); // Check if admin is logged in

  return token ? (
    <Suspense fallback={<AdminLoading />}>
      <Outlet />
    </Suspense>
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

export default ProtectedRoute;
