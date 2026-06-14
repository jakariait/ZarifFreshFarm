import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";
import ProductForm from "../component/componentAdmin/ProductForm.jsx";

const EditProductPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="PRODUCT" title="Edit Product" />
      <RequirePermission permission="edit_products">
        <ProductForm isEdit={true} />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default EditProductPage;
