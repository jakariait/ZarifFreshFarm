import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import AllOrders from "../component/componentAdmin/AllOrders.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const InTransitOrdersPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="ORDERS" title="View All In Transit Orders" />
      <RequirePermission permission="view_orders">
        <AllOrders title={"In Transit Orders"} status={"intransit"} />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default InTransitOrdersPage;
