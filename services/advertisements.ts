import axios from "axios";

export async function fetchAdvertisements(): Promise<Advertisement.Advertisement[]> {
  const response = await axios.get(`/api/advertisements`);
  
  if (response.status !== 200) {
    throw new Error('Failed to fetch pending advertisements');
  }
  
  return response.data.ads as Advertisement.Advertisement[];
}

export async function deleteAdvertisement(id: number): Promise<void> {
  const response = await axios.delete(`/api/advertisements/${id}`);
  
  if (response.status !== 200) {
    throw new Error('Failed to delete advertisement');
  }
}

export async function setPrimaryAdvertisement(id: number): Promise<Advertisement.Advertisement> {
  const response = await axios.patch(`/api/advertisements/${id}`, {
    display_order: 0
  });
  
  if (response.status !== 200) {
    throw new Error('Failed to set advertisement as primary');
  }
  
  return response.data as Advertisement.Advertisement;
}