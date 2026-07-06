import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";
import AdminPathaoConfig from "../component/componentAdmin/AdminPathaoConfig.jsx";

const PathaoConfigPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "WEBSITE CONFIG", title: "Pathao API"}}>
      <div>
        <RequirePermission permission="pathao_api">
          <AdminPathaoConfig />
        </RequirePermission>
      </div>
    </LayoutAdmin>
  );
};

export default PathaoConfigPage;
