import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import AllOrders from "../component/componentAdmin/AllOrders.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const PendingOrdersPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="ORDERS" title="View All Pending Orders" />
      <RequirePermission permission="view_orders">
        <AllOrders title={"Pending Orders"} status={"pending"} />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default PendingOrdersPage;
