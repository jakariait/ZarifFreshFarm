import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import PageEditor from "../component/componentAdmin/PageEditor.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";
import { Separator } from "@/components/ui/separator.jsx";

const AddNewCategoryPage = () => {
  return (
    <LayoutAdmin
      breadcrumbData={{
        pageDetails: "TERM OF SERIVICES",
        title: "Update Terms of Services",
      }}
    >
      <RequirePermission permission="about_terms-policies">
        <PageEditor title="Terms of Services" endpoint="terms" />
        <Separator />
        <PageEditor title="Privacy Policy" endpoint="privacy" />
        <Separator />
        <PageEditor title="Refund Policy" endpoint="refund" />
        <Separator />
        <PageEditor title="Shipping Policy" endpoint="shipping" />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default AddNewCategoryPage;
