import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";
import ProductOptionsAllinone from "../component/componentAdmin/ProductOptionsAllinone.jsx";

const ProductOptionsPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "PRODUCT OPTIONS", title: "View all Product Options"}}>
      <RequirePermission permission="product_size">
        <ProductOptionsAllinone />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default ProductOptionsPage;
