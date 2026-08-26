import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../../api/api";
import "./DoctorLogin.css";

function DoctorLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest(
        "/api/auth/login",
        {
          method: "POST",

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (data.user.role !== "doctor") {
        setError("This account is not a doctor account.");
        return;
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      alert("Doctor login successful!");

      navigate("/doctor/dashboard");

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-login-page">

      <div className="doctor-login-card">

        {/* BRAND */}
        <div className="doctor-login-brand">
          MEDIKIOSK
        </div>

        <p className="doctor-login-subtitle">
          Secure healthcare management platform
        </p>

        {/* TITLE */}
        <h1 className="doctor-login-title">
          Doctor Login
        </h1>

        {/* FORM */}
        <form
          className="doctor-login-form"
          onSubmit={handleLogin}
        >

          {/* EMAIL */}
          <div className="doctor-login-form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter email"
              required
            />

          </div>


          {/* PASSWORD */}
          <div className="doctor-login-form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              required
            />

          </div>


          {/* ERROR */}
          {error && (
            <div className="doctor-login-error">
              {error}
            </div>
          )}


          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="doctor-login-btn"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>


        {/* REGISTER LINK */}
        <div className="doctor-register-link">

          Don't have an account?

          <Link to="/doctor/register">
            Register as Doctor
          </Link>

        </div>

      </div>

    </div>
  );
}

export default DoctorLogin;