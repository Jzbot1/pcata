import React, { useEffect, useState } from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminSidemenu from "./AdminSidemenu";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const SUPER_ADMIN_EMAILS = [
  "zomuansangajacob523@gmail.com",
  "mszapachuau@gmail.com",
  "aashirdigital@gmail.com",
];

const AdminLayout = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (user) {
      const isSuper =
        user.email &&
        SUPER_ADMIN_EMAILS.some(
          (em) => em.toLowerCase() === user.email.toLowerCase()
        );
      if (!user.isAdmin && !isSuper) {
        navigate("/user-dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div className="admin-layout-container">
      <AdminHeader onToggleMenu={() => setMenu(!menu)} />

      <div
        className={`admin-sidemenu-overlay ${menu ? "active" : ""}`}
        onClick={() => setMenu(false)}
      />
      <AdminSidemenu menu={menu} setMenu={setMenu} />

      <div className="admin-body">
        <aside className="admin-sidebar d-none d-lg-block">
          <AdminSidebar />
        </aside>
        <main className="admin-body-content">{children}</main>
      </div>

      <footer className="d-none d-lg-block">
        <div className="admin-footer">
          <span>ADMIN CONTROL PANEL</span>
          <span>© Zelan Store</span>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;

