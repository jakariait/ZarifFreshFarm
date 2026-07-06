import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";
import ProductForm from "../component/componentAdmin/ProductForm.jsx";

const EditProductPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "PRODUCT", title: "Edit Product"}}>
      <RequirePermission permission="edit_products">
        <ProductForm isEdit={true} />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default EditProductPage;
