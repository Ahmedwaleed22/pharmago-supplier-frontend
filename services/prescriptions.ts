import axios from "axios";

// Local DTO type to avoid relying on global namespace types here
type PrescriptionDto = {
  id: string;
  name: string;
  patient: { id: string; name: string };
  file_path: string | null;
  prescription_text: string | null;
  created_at: string;
  status: string;
};

export async function fetchPendingPrescriptions(): Promise<PrescriptionDto[]> {
  const response = await axios.get(`/api/prescriptions/pending`);

  if (response.status !== 200) {
    throw new Error('Failed to fetch pending prescriptions');
  }
  
  return response.data.data as PrescriptionDto[];
}

export async function fetchApprovedPrescriptions(): Promise<PrescriptionDto[]> {
  const response = await axios.get(`/api/prescriptions/approved`);

  if (response.status !== 200) {
    throw new Error('Failed to fetch approved prescriptions');
  }

  return response.data.data as PrescriptionDto[];
}

export async function fetchPrescription(id: string): Promise<PrescriptionDto> {
  const response = await axios.get(`/api/prescriptions/${id}`);

  if (response.status !== 200) {
    throw new Error('Failed to fetch prescription');
  }
  
  return response.data.data as PrescriptionDto;
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

export async function fetchAllPrescriptions(): Promise<PrescriptionDto[]> {
  const response = await axios.get(`/api/prescriptions`);

  if (response.status !== 200) {
    throw new Error('Failed to fetch prescription offers');
  }

  return response.data.data as PrescriptionDto[];
}

export async function dismissPrescription(prescriptionId: string): Promise<void> {
  const response = await axios.delete(`/api/prescriptions/${prescriptionId}/visibility`);
  if (response.status !== 200) {
    throw new Error('Failed to dismiss prescription');
  }
}