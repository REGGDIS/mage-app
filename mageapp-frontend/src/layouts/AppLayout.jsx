import React from "react";
import { Outlet } from "react-router-dom";
import NavbarApp from "../components/NavbarApp.jsx";

const AppLayout = () => {
  return (
    <>
      <NavbarApp />
      <main className="container mb-4">
        <Outlet />
      </main>
    </>
  );
};

export default AppLayout;
