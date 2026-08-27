import { useNavigate } from "react-router-dom";

function Navbar({ userName }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear login/session information
    localStorage.clear();

    // Go back to the MEDIKIOSK home page
    navigate("/");
  };

  return (
    <header className="navbar">

      <div className="navbar-brand">
        🏥 MEDNEXUS
      </div>

      <div className="navbar-right">

        <span className="welcome-user">
          Welcome, {userName}
        </span>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

        <div className="profile-icon">
          👤
        </div>

      </div>

    </header>
  );
}

export default Navbar;