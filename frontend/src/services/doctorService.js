import api from "./api";


// Doctor registration
export const registerDoctor = async (doctorData) => {

  const response = await api.post(
    "/doctors/register",
    doctorData
  );

  return response.data;
};


// Doctor login
export const loginDoctor = async (loginData) => {

  const response = await api.post(
    "/doctors/login",
    loginData
  );

  return response.data;
};


// Get doctor details
export const getDoctorById = async (doctorId) => {

  const response = await api.get(
    `/doctors/${doctorId}`
  );

  return response.data;
};


// Get patients assigned to doctor
export const getDoctorPatients = async (doctorId) => {

  const response = await api.get(
    `/doctors/${doctorId}/patients`
  );

  return response.data;
};


// Get a patient's details for doctor
export const getPatientDetails = async (patientId) => {

  const response = await api.get(
    `/doctors/patients/${patientId}`
  );

  return response.data;
};