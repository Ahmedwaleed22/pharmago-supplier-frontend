import axios from "axios";

export async function fetchPendingPrescriptions(): Promise<Prescription.Prescription[]> {
  const response = await axios.get(`/api/prescriptions/pending`);

  if (response.status !== 200) {
    throw new Error('Failed to fetch pending prescriptions');
  }
  
  return response.data.data as Prescription.Prescription[];
}

export async function fetchApprovedPrescriptions(): Promise<Prescription.Prescription[]> {
  const response = await axios.get(`/api/prescriptions/approved`);

  if (response.status !== 200) {
    throw new Error('Failed to fetch approved prescriptions');
  }

  return response.data.data as Prescription.Prescription[];
}

export async function fetchPrescription(id: string): Promise<Prescription.Prescription> {
  const response = await axios.get(`/api/prescriptions/${id}`);

  if (response.status !== 200) {
    throw new Error('Failed to fetch prescription');
  }
  
  return response.data.data as Prescription.Prescription;
}

export async function sendPrescriptionOffer(
  prescriptionId: string, 
  price: string, 
  discount?: string
): Promise<any> {
  const response = await axios.post(`/api/prescriptions/${prescriptionId}/offer`, {
    price,
    discount: discount || null
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error('Failed to send prescription offer');
  }
  
  return response.data;
}

export async function fetchAllPrescriptions(): Promise<Prescription.Prescription> {
  const response = await axios.get(`/api/prescriptions`);

  if (response.status !== 200) {
    throw new Error('Failed to fetch prescription offers');
  }

  return response.data.data as Prescription.Prescription;
}