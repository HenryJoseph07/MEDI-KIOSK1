import { BrowserRouter, Routes, Route } from "react-router-dom";
//import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import Home from "./pages/Home";
import PatientDetails from "./pages/doctor/PatientDetails";

import PatientLogin from "./pages/patient/PatientLogin";
import PatientRegistration from "./pages/patient/PatientRegistration";
import PatientDashboard from "./pages/patient/PatientDashboard";
import UploadDocument from "./pages/patient/UploadDocument";
import HealthSummaryPage from "./pages/patient/HealthSummaryPage";

import DoctorLogin from "./pages/doctor/DoctorLogin";
import DoctorRegistration from "./pages/doctor/DoctorRegistration";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            HOME
        ========================= */}

        <Route path="/" element={<Home />} />


        {/* =========================
            PATIENT
        ========================= */}

        <Route
          path="/patient/login"
          element={<PatientLogin />}
        />
        <Route
  path="/doctor/dashboard"
  element={
    <ProtectedRoute role="doctor">
      <DoctorDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/doctor-dashboard"
  element={
    <ProtectedRoute role="doctor">
      <DoctorDashboard />
    </ProtectedRoute>
  }
/>

        <Route
          path="/patient/register"
          element={<PatientRegistration />}
        />

        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute role="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/upload-document"
          element={
            <ProtectedRoute role="patient">
              <UploadDocument />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/health-summary"
          element={
            <ProtectedRoute role="patient">
              <HealthSummaryPage />
            </ProtectedRoute>
          }
        />


        {/* =========================
            DOCTOR
        ========================= */}

        <Route
          path="/doctor/login"
          element={<DoctorLogin />}
        />
        {/* =========================
    DOCTOR
========================= */}

<Route
  path="/doctor/login"
  element={<DoctorLogin />}
/>

<Route
  path="/doctor/register"
  element={<DoctorRegistration />}
/>
<Route
  path="/doctor/patient/:id"
  element={
    <ProtectedRoute role="doctor">
      <PatientDetails />
    </ProtectedRoute>
  }
/>
<Route
  path="/doctor/dashboard"
  element={
    <ProtectedRoute role="doctor">
      <DoctorDashboard />
    </ProtectedRoute>
  }
/>
        <Route
          path="/doctor/register"
          element={<DoctorRegistration />}
        />


        {/* =========================
            OLD ROUTES
            Keep these so existing
            links don't break.
        ========================= */}

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

        <Route
          path="/doctor-login"
          element={<DoctorLogin />}
        />

        <Route
          path="/doctor-register"
          element={<DoctorRegistration />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;