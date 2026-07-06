import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import ViewAllProducts from "../component/componentAdmin/ViewAllProducts.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const ViewAllProductPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "PRODUCTS", title: "View All Products"}}>
      
      <RequirePermission permission="view_products">
        <ViewAllProducts />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default ViewAllProductPage;
