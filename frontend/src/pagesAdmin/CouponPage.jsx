import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import CouponTable from "../component/componentAdmin/CouponTable.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const AddNewCategoryPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "PROMO CODE", title: "View and Create Promo Code"}}>
      <RequirePermission permission="manage_coupons">
        <CouponTable />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default AddNewCategoryPage;
