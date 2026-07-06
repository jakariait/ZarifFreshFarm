import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import AdminCreate from "../component/componentAdmin/AdminCreate.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const CreateAdminPage = () => {
  return (
    <LayoutAdmin breadcrumbData={{pageDetails: "SYSTEM USERS", title: "Create System User"}}>
      <RequirePermission permission="admin-users">
        <AdminCreate />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default CreateAdminPage;
