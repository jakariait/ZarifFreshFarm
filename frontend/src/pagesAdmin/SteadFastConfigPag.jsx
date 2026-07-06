import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import AdminSteadfastConfig from "../component/componentAdmin/AdminSteadfastConfig.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const GeneralInfoPage = ({ pageDetails, title }) => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "WEBSITE CONFIG", title: "Steadfast API"}}>
      <div>
        <RequirePermission permission="steadfast_api">
          <AdminSteadfastConfig />
        </RequirePermission>
      </div>
    </LayoutAdmin>
  );
};

export default GeneralInfoPage;
