import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import AllOrders from "../component/componentAdmin/AllOrders.jsx";
import OrderStats from "../component/componentAdmin/OrderStats.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";
import AdminNewOrderCreate from "../component/componentAdmin/AdminNewOrderCreate.jsx";

const AllOrdersPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="ORDERS" title="View All Orders" />
      {/* Order status totals */}
      <RequirePermission permission="view_orders">

        <div className={"flex items-center justify-center"}>
          <AdminNewOrderCreate />
        </div>

        <OrderStats />
        <AllOrders title={"All Orders"} />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default AllOrdersPage;
