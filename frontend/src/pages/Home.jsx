import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">

      {/* Main Project Title */}
      <div className="project-title">
        <h2>🏥 MEDIKIOSK</h2>
        <p>Digital Patient Case Management System</p>
      </div>

      {/* Main Content */}
      <main className="home-content">

        <h1>Welcome to MEDIKIOSK</h1>

        <p className="home-description">
          Securely manage patient records, medical documents and clinical
          information.
        </p>

        {/* Patient + Doctor Cards */}
        <div className="account-cards">

          {/* Doctor Card */}
          <div className="account-card">

            <div className="account-image-container">
              <img
                src="/doctor.png"
                alt="Doctor"
                className="account-image"
              />
            </div>

            <h2>Doctor</h2>

            <p>
              Access patient cases, review medical documents and manage
              clinical information.
            </p>

            <Link
              to="/doctor/login"
              className="home-login-btn"
            >
              Doctor Login
            </Link>

            <p className="register-link">
              New doctor?{" "}
              <Link to="/doctor/register">
                Register here
              </Link>
            </p>

          </div>


          {/* Patient Card */}
          <div className="account-card">

            <div className="account-image-container">
              <img
                src="/patient.png"
                alt="Patient"
                className="account-image"
              />
            </div>

            <h2>Patient</h2>

            <p>
              Access your medical records, upload documents and view your
              health summary.
            </p>

            <Link
              to="/patient/login"
              className="home-login-btn"
            >
              Patient Login
            </Link>

            <p className="register-link">
              New patient?{" "}
              <Link to="/patient/register">
                Register here
              </Link>
            </p>

          </div>

        </div>

      </main>


      {/* Footer */}
      <footer className="home-footer">
        © 2026 MEDIKIOSK | Patient Case Management System
      </footer>

    </div>
  );
}

export default Home;