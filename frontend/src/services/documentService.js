import api from "./api";


// Get all documents of a patient
export const getPatientDocuments = async (patientId) => {

  const response = await api.get(
    `/documents/patient/${patientId}`
  );

  return response.data;
};


// Upload medical document
export const uploadDocument = async (
  patientId,
  file
) => {

  const formData = new FormData();

  formData.append("patientId", patientId);
  formData.append("document", file);

  const response = await api.post(
    "/documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return response.data;
};


// Get a particular document
export const getDocumentById = async (documentId) => {

  const response = await api.get(
    `/documents/${documentId}`
  );

  return response.data;
};


// Delete document
export const deleteDocument = async (documentId) => {

  const response = await api.delete(
    `/documents/${documentId}`
  );

  return response.data;
};