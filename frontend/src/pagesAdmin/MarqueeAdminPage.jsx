import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import MarqueeAdmin from "../component/componentAdmin/MarqueeAdmin.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const GeneralInfoPage = ({ pageDetails, title }) => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "WEBSITE CONFIG", title: "Scroll Text"}}>
      <div>
        {/* Form Section */}
        <RequirePermission permission="scroll_text">
          <MarqueeAdmin />
        </RequirePermission>
      </div>
    </LayoutAdmin>
  );
};

export default GeneralInfoPage;
