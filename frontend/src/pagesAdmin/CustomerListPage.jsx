import React from "react";
import CustomerList from "../component/componentAdmin/CustomerList.jsx";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";
import CustomerListFromOrder from "@/component/componentAdmin/CustomerListFromOrder.jsx";

const CustomerListPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "CUSTOMERS", title: "View All Customers"}}>

      <RequirePermission permission="view_customers">
        <div className={"flex flex-col gap-10"}>
          <CustomerListFromOrder />
          <CustomerList />
        </div>

      </RequirePermission>
    </LayoutAdmin>
  );
};

export default CustomerListPage;
