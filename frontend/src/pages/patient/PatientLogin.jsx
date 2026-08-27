import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../../api/api";

function PatientLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (data.user.role !== "patient") {
        alert("This account is not a patient account.");
        return;
      }

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      alert("Login successful!");

      navigate("/patient-dashboard");

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

    <div className="auth-card">

      <div className="auth-header">
        <h1>MEDNEXUS</h1>
        <p>Digital Patient Case Management System</p>
      </div>

      <h2>Patient Login</h2>

      <form onSubmit={handleLogin} className="auth-form">

        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

      <p className="auth-link">
        Don't have an account?{" "}
        <Link to="/patient/register">
          Register as Patient
        </Link>
      </p>

      <p className="auth-link">
        <Link to="/doctor/login">
          Doctor Login
        </Link>
      </p>

    </div>

  </div>
  );
}

export default PatientLogin;