import axios from 'axios';

export async function getDeliveryHistory(status: string, page: number = 1, search: string = ""): Promise<Dashboard.OrderHistoryResponse> {
  // Use our internal API route which will handle auth token properly
  const response = await axios.get('/api/delivery/history', {
    params: {
      status,
      page,
      search,
    },
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch delivery history');
  }
  
  return response.data;
}

export async function getDeliveryLiveTracking(): Promise<Dashboard.OrderHistoryResponse> {
  // Use our internal API route which will handle auth token properly
  const response = await axios.get('/api/delivery/live-tracking');

  if (response.status !== 200) {
    throw new Error('Failed to fetch delivery live tracking');
  }
  
  return response.data;
}

export async function getOrderStatus({ order_id }: { order_id: string }): Promise<Dashboard.OrderHistoryResponse> {
  // Use our internal API route which will handle auth token properly
  const response = await axios.get('/api/delivery/order-status', {
    params: {
      order_id,
    },
  });

  console.log("response", response);

  if (response.status !== 200) {
    throw new Error('Failed to fetch order status');
  }
  
  return response.data;
}