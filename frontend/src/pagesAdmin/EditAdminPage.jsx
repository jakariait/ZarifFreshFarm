import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import EditAdmin from "../component/componentAdmin/EditAdmin.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const EditAdminPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "SYSTEM USERS", title: "Update System User"}}>
      <RequirePermission permission="admin-users">
        <EditAdmin />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default EditAdminPage;
