import React from "react";
import Layout from "../componentGeneral/Layout.jsx";

const UserLoading = () => {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </Layout>
  );
};

export default UserLoading;
