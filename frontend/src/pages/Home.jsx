import { Link } from "react-router-dom";

function Home() {
 return (
  <div className="home-page">

    {/* =========================
        BRAND HEADER
    ========================= */}
    <header className="home-brand">

      <div className="home-logo">
        <img
          src="/mednexus-logo.png"
          alt="MEDNEXUS"
        />
      </div>

      <div>
        <h1>MEDNEXUS</h1>
        <p>Digital Patient Case Management System</p>
      </div>

    </header>

      {/* =========================
          WELCOME SECTION
      ========================= */}
      <main className="home-content">

        <section className="home-intro">

          <h2>Welcome to MEDNEXUS</h2>

          <p>
            Securely manage patient records, medical documents,
            and clinical information in one place.
          </p>

        </section>


        {/* =========================
            USER TYPE SELECTION
        ========================= */}
        <section className="account-cards">

          {/* DOCTOR */}
          <article className="account-card">

            <div className="account-image-container">
              <img
                src="/doctor.png"
                alt="Doctor"
                className="account-image"
              />
            </div>

            <div className="account-card-content">

              <span className="account-label">
                For Healthcare Professionals
              </span>

              <h2>Doctor</h2>

              <p>
                Review patient cases, access medical documents,
                and manage clinical information.
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

          </article>


          {/* PATIENT */}
          <article className="account-card">

            <div className="account-image-container">
              <img
                src="/patient.png"
                alt="Patient"
                className="account-image"
              />
            </div>

            <div className="account-card-content">

              <span className="account-label">
                For Patients
              </span>

              <h2>Patient</h2>

              <p>
                Access your medical records, upload documents,
                and view your AI-powered health summary.
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

          </article>

        </section>

      </main>


      {/* =========================
          FOOTER
      ========================= */}
      <footer className="home-footer">
        © 2026 MEDNEXUS
        <span>•</span>
        Digital Patient Case Management System
      </footer>

    </div>
  );
}

export default Home;