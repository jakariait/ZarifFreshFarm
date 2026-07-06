import React from 'react';
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import BlogList from "../component/componentAdmin/BlogList.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const BlogsListPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "BLOGS", title: "Create a Blog"}}>
      <div>
        <RequirePermission permission="blogs">
          <BlogList/>
        </RequirePermission>
      </div>
    </LayoutAdmin>
  );
};

export default BlogsListPage;