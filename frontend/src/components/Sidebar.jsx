import { NavLink } from "react-router-dom";

function Sidebar({ type = "patient" }) {

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        MEDIKIOSK
      </div>

      <nav className="sidebar-menu">

        {type === "patient" ? (
          <>
            <NavLink to="/patient/dashboard">
              🏠 Dashboard
            </NavLink>

            <NavLink to="/patient/upload">
              📄 Documents
            </NavLink>

            <NavLink to="/patient/summary">
              🩺 Health Summary
            </NavLink>

            <NavLink to="/patient/dashboard">
              👤 Profile
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/doctor/dashboard">
              🏠 Dashboard
            </NavLink>

            <NavLink to="/doctor/dashboard">
              👥 Patients
            </NavLink>

            <NavLink to="/doctor/dashboard">
              📄 Documents
            </NavLink>
          </>
        )}

      </nav>

    </aside>
  );
}

export default Sidebar;