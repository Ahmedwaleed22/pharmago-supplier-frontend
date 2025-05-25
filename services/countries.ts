import axios from "axios";

export async function getCountries(language: string): Promise<Countries.Country[]> {
  // Use our internal API route which will handle auth token properly
  const response = await axios.get('/api/countries', {
    headers: {
      'Accept-Language': language,
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch countries');
  }
  
  return response.data as Countries.Country[];
}