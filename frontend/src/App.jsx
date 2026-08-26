import { BrowserRouter, Routes, Route } from "react-router-dom";

import PatientLogin from "./pages/patient/PatientLogin";
import PatientRegistration from "./pages/patient/PatientRegistration";
import PatientDashboard from "./pages/patient/PatientDashboard";
import UploadDocument from "./pages/patient/UploadDocument";
import HealthSummaryPage from "./pages/patient/HealthSummaryPage";

import DoctorLogin from "./pages/doctor/DoctorLogin";
import DoctorRegistration from "./pages/doctor/DoctorRegistration";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* PATIENT */}

        <Route
          path="/patient-login"
          element={<PatientLogin />}
        />

        <Route
          path="/patient-register"
          element={<PatientRegistration />}
        />

        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute role="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload-document"
          element={
            <ProtectedRoute role="patient">
              <UploadDocument />
            </ProtectedRoute>
          }
        />

        <Route
          path="/health-summary"
          element={
            <ProtectedRoute role="patient">
              <HealthSummaryPage />
            </ProtectedRoute>
          }
        />

        {/* DOCTOR */}

        <Route
          path="/doctor-login"
          element={<DoctorLogin />}
        />

        <Route
          path="/doctor-register"
          element={<DoctorRegistration />}
        />

        {/* Default */}

        <Route
          path="/"
          element={
            <div>
              <h1>MEDIKIOSK</h1>

              <a href="/patient-login">
                Patient Login
              </a>

              <br />

              <a href="/doctor-login">
                Doctor Login
              </a>
            </div>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;