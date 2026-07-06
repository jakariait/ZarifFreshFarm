import React from 'react';
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";
import EditBlog from "../component/componentAdmin/EditBlog.jsx";

const EditBlogPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "BLOGS", title: "Edit Blog"}}>
      <div>
        <RequirePermission permission="blogs">
          <EditBlog />
        </RequirePermission>
      </div>
    </LayoutAdmin>
  );
};

export default EditBlogPage;