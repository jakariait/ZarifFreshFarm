import React from "react";
import LayoutAdmin from "../componentAdmin/LayoutAdmin.jsx";

const AdminLoading = () => {
  return (
    <LayoutAdmin>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </LayoutAdmin>
  );
};

export default AdminLoading;
