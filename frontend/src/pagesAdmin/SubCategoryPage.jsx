import React from 'react';
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";
import SubCategoryAllinone from "../component/componentAdmin/SubCategoryAllinone.jsx";

const SubCategoryPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "SUB CATEGORY", title: "View And Edit All Sub Categories"}}>
      <RequirePermission permission="sub_category">
        <SubCategoryAllinone/>
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default SubCategoryPage;