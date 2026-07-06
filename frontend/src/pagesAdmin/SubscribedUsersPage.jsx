import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import SubscribersList from "../component/componentAdmin/SubscribersList.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const SubscribedUsersPage = ({ title, pageDetails }) => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "USER SUBSCRIPTION", title: "View All Subscribed Users"}}>
      <div>
        {/* Form Section */}
        <RequirePermission permission="subscribed_users">
          <div className="bg-white shadow-lg p-6 rounded-lg">
            <SubscribersList />
          </div>
        </RequirePermission>
      </div>
    </LayoutAdmin>
  );
};

export default SubscribedUsersPage;
