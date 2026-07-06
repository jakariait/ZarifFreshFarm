import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import ContactTable from "../component/componentAdmin/ContactTable.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const ContactRequestPage = () => {
  return (
    <LayoutAdmin
      breadcrumbData={{
        pageDetails: "CONTACT REQUEST",
        title: "View All Contact Request",
      }}
    >
      <RequirePermission permission="contact_request">
        <ContactTable />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default ContactRequestPage;
