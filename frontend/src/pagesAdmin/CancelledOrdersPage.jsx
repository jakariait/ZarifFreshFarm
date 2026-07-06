import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import AllOrders from "../component/componentAdmin/AllOrders.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const CancelledOrdersPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "ORDERS", title: "View All Cancelled Orders"}}>
      <RequirePermission permission="view_orders">
        <AllOrders title={"Cancelled Orders"} status={"cancelled"} />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default CancelledOrdersPage;
