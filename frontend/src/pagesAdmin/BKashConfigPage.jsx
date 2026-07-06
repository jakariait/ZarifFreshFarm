import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import AdminBkashConfig from "../component/componentAdmin/AdminBkashConfig.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const GeneralInfoPage = ({ pageDetails, title }) => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "WEBSITE CONFIG", title: "bKash Configuration"}}>
      <div>
        {/* Form Section */}
        <RequirePermission permission="bkash_api">
          <AdminBkashConfig />
        </RequirePermission>
      </div>
    </LayoutAdmin>
  );
};

export default GeneralInfoPage;
