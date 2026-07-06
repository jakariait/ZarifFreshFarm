import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";
import ProductForm from "../component/componentAdmin/ProductForm.jsx";

const AddNewProductPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "PRODUCT", title: "Add New Product"}}>
      <RequirePermission permission="add_products">
        <ProductForm isEdit={false} />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default AddNewProductPage;
