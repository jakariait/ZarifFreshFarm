import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import DeliveryCharge from "../component/componentAdmin/DeliveryCharge.jsx";
import CreateShipping from "../component/componentAdmin/CreateShipping.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const DeliveryChargePage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "DELIVERY CHARGE", title: "View All Deivery Charges"}}>
      <RequirePermission permission="delivery_charges">
        <div className="flex flex-col gap-16">
          <CreateShipping />
          <DeliveryCharge />
        </div>
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default DeliveryChargePage;
