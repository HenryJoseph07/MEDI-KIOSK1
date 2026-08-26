import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../../api/api";

function PatientRegistration() {
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
            role: "patient",
          }),
        }
      );

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      alert("Patient registration successful!");

      navigate("/patient-dashboard");

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>MEDIKIOSK</h1>

      <h2>Patient Registration</h2>

      <form onSubmit={handleRegister}>

        <div>
          <label>Full Name</label>

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter email"
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter password"
          />
        </div>

        <div>
          <label>Confirm Password</label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Confirm password"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading
            ? "Registering..."
            : "Register"}
        </button>

      </form>

      <p>
        Already registered?{" "}
        <Link to="/patient-login">
          Patient Login
        </Link>
      </p>
    </div>
  );
}

export default PatientRegistration;