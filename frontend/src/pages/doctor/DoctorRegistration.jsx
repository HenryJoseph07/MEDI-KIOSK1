import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../../api/api";
import "./DoctorRegistration.css";

function DoctorRegistration() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest(
        "/api/auth/register",
        {
          method: "POST",

          body: JSON.stringify({
            name,
            email,
            password,
            role: "doctor",
          }),
        }
      );

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      alert("Doctor registration successful!");

      navigate("/doctor/dashboard");

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-registration-page">

      <div className="doctor-registration-card">

        {/* BRAND */}
        <div className="doctor-registration-brand">
          MEDNEXUS
        </div>

        <p className="doctor-registration-subtitle">
          Secure healthcare management platform
        </p>

        {/* TITLE */}
        <h1 className="doctor-registration-title">
          Doctor Registration
        </h1>

        {/* FORM */}
        <form
          className="doctor-registration-form"
          onSubmit={handleRegister}
        >

          {/* DOCTOR NAME */}
          <div className="doctor-form-group">

            <label htmlFor="doctor-name">
              Doctor Name
            </label>

            <input
              id="doctor-name"
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter doctor name"
            />

          </div>


          {/* EMAIL */}
          <div className="doctor-form-group">

            <label htmlFor="doctor-email">
              Email
            </label>

            <input
              id="doctor-email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter email"
            />

          </div>


          {/* PASSWORD */}
          <div className="doctor-form-group">

            <label htmlFor="doctor-password">
              Password
            </label>

            <input
              id="doctor-password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
            />

          </div>


          {/* CONFIRM PASSWORD */}
          <div className="doctor-form-group">

            <label htmlFor="doctor-confirm-password">
              Confirm Password
            </label>

            <input
              id="doctor-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm password"
            />

          </div>


          {/* REGISTER */}
          <button
            type="submit"
            className="doctor-register-btn"
            disabled={loading}
          >
            {loading
              ? "Registering..."
              : "Register"}
          </button>

        </form>


        {/* LOGIN */}
        <p className="doctor-login-link">
          Already registered?{" "}

          <Link to="/doctor-login">
            Doctor Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default DoctorRegistration;