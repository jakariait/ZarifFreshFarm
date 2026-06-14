import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import AllOrders from "../component/componentAdmin/AllOrders.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const ApprovedOrdersPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="ORDERS" title="View All Approved Orders" />
      <RequirePermission permission="view_orders">
        <AllOrders title={"Approved Orders"} status={"approved"} />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default ApprovedOrdersPage;
