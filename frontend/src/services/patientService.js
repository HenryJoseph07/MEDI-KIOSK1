import api from "./api";


// Register a new patient
export const registerPatient = async (patientData) => {
  const response = await api.post(
    "/patients/register",
    patientData
  );

  return response.data;
};


// Patient login
export const loginPatient = async (loginData) => {
  const response = await api.post(
    "/patients/login",
    loginData
  );

  return response.data;
};


// Get patient details
export const getPatientById = async (patientId) => {
  const response = await api.get(
    `/patients/${patientId}`
  );

  return response.data;
};


// Update patient profile
export const updatePatient = async (
  patientId,
  patientData
) => {

  const response = await api.put(
    `/patients/${patientId}`,
    patientData
  );

  return response.data;
};