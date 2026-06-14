import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import AllOrders from "../component/componentAdmin/AllOrders.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const ReturnedOrdersPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="ORDERS" title="View All Returned Orders" />
      <RequirePermission permission="view_orders">
        <AllOrders title={"Returned Orders"} status={"returned"} />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default ReturnedOrdersPage;
