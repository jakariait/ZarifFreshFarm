import React from 'react';
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";
import AdminCategoryAllinone from "../component/componentAdmin/AdminCategoryAllinone.jsx";

const CategoryPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb
        pageDetails="CATEGORY"
        title="View And Edit All Categories"
      />
      <RequirePermission permission="category">
        <AdminCategoryAllinone />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default CategoryPage;