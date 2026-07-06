import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import AdminList from "../component/componentAdmin/AdminList.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const AdminListPage = () => {
  return (
    <LayoutAdmin
      breadcrumbData={{
        pageDetails: "SYSTEM USERS",
        title: "View All System Users",
      }}
    >
      <RequirePermission permission="admin-users">
        <AdminList />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default AdminListPage;
