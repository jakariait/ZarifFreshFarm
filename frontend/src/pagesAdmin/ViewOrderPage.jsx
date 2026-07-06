import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import ViewOrder from "../component/componentAdmin/ViewOrder.jsx";

const AddNewCategoryPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "CATEGORY", title: "View All Categories"}}>
      <ViewOrder/>
    </LayoutAdmin>
  );
};

export default AddNewCategoryPage;
