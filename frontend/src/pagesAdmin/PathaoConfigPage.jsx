import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";
import AdminPathaoConfig from "../component/componentAdmin/AdminPathaoConfig.jsx";

const PathaoConfigPage = () => {
  return (
    <LayoutAdmin>
      <div>
        <Breadcrumb title={"Pathao API"} pageDetails={"WEBSITE CONFIG"} />
        <RequirePermission permission="pathao_api">
          <AdminPathaoConfig />
        </RequirePermission>
      </div>
    </LayoutAdmin>
  );
};

export default PathaoConfigPage;
