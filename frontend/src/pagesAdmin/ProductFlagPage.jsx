import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import FlagsComponent from "../component/componentAdmin/FlagsComponent.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const ProductFlagPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "PRODUCT FLAG", title: "View All Product Flags"}}>
      <RequirePermission permission="product_flag">
        <FlagsComponent />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default ProductFlagPage;
