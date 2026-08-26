import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import PatientRegistration from "../pages/patient/PatientRegistration";
import PatientLogin from "../pages/patient/PatientLogin";
import PatientDashboard from "../pages/patient/PatientDashboard";
import UploadDocument from "../pages/patient/UploadDocument";
import HealthSummaryPage from "../pages/patient/HealthSummaryPage";
import DoctorRegistration from "../pages/doctor/DoctorRegistration";
import DoctorLogin from "../pages/doctor/DoctorLogin";
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import PatientDetails from "../pages/doctor/PatientDetails";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Patient */}
      <Route
        path="/patient/register"
        element={<PatientRegistration />}
      />

      <Route path="/patient/login" element={<PatientLogin />} />

      <Route
        path="/patient/dashboard"
        element={<PatientDashboard />}
      />

      <Route
        path="/patient/upload"
        element={<UploadDocument />}
      />

      <Route
        path="/patient/summary"
        element={<HealthSummaryPage />}
      />

      {/* Doctor */}
      <Route path="/doctor/login" element={<DoctorLogin />} />

      <Route path="/doctor/register" element={<DoctorRegistration />} />

      <Route
        path="/doctor/dashboard"
        element={<DoctorDashboard />}
      />

      <Route
        path="/doctor/patient/:id"
        element={<PatientDetails />}
      />
    </Routes>
  );
}

export default AppRoutes;