import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import AddBlog from "../component/componentAdmin/AddBlog.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const CreateBlogPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "BLOGS", title: "Create a Blog"}}>
      <div>
        <RequirePermission permission="blogs">
          <AddBlog />
        </RequirePermission>
      </div>
    </LayoutAdmin>
  );
};

export default CreateBlogPage;
