import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";
import ChildCategoryAllinone from "../component/componentAdmin/ChildCategoryAllinone.jsx";

const ChildCategoryPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "CHILD CATEGORY", title: "View And Edit All Child Categories"}}>
      <RequirePermission permission="child_category">
        <ChildCategoryAllinone />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default ChildCategoryPage;
