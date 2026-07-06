import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import ConfigSetup from "../component/componentAdmin/ConfigSetup.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const ConfigSetupPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "CONFIG", title: "Setup Config"}}>
      <RequirePermission permission="setup_config">
        <ConfigSetup />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default ConfigSetupPage;
