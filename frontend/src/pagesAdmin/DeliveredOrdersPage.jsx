import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import AllOrders from "../component/componentAdmin/AllOrders.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const DeliveredOrdersPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="ORDERS" title="View All Delivered Orders" />
      <RequirePermission permission="view_orders">
        <AllOrders title={"Delivered Orders"} status={"delivered"} />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default DeliveredOrdersPage;
