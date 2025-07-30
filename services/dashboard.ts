import axios from 'axios';

// Types
export interface DashboardAnalytics {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
}

// Client-side dashboard analytics
export async function getDashboardAnalytics(): Promise<Dashboard.Analytics> {
  // Use our internal API route which will handle auth token properly
  const response = await axios.get('/api/dashboard');

  if (response.status !== 200) {
    throw new Error('Failed to fetch dashboard analytics');
  }
  
  return response.data;
}

export async function getDashboardSales(): Promise<Dashboard.Sales> {
  const response = await axios.get('/api/dashboard/sales');

  if (response.status !== 200) {
    throw new Error('Failed to fetch dashboard sales');
  }
  
  return response.data;
}

export async function getDashboardProducts(
  categoryId: string, 
  subCategoryId: string, 
  searchTerm: string, 
  page: number = 1, 
  limit: number = 10
): Promise<{ data: Product.Medicine[], meta: { total: number, current_page: number, last_page: number } }> {
  try {
    console.log(`Fetching products with params: category=${categoryId}, subCategory=${subCategoryId}, search=${searchTerm}, page=${page}, limit=${limit}`);
    
    const response = await axios.get('/api/dashboard/products', {
      params: {
        category_id: subCategoryId || categoryId,
        search: searchTerm,
        page,
        limit
      }
    });

    console.log('API response in service:', response.data);

    if (response.status !== 200) {
      throw new Error('Failed to fetch dashboard products');
    }
    
    // The API doesn't appear to return pagination metadata, just a data array
    // So we'll create a simple implementation of pagination
    // This assumes the API returns fewer items when reaching the end
    
    // Get products from the response
    let products: Product.Medicine[] = [];
    
    if (Array.isArray(response.data)) {
      products = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      products = response.data.data;
    } else {
      console.error('Unexpected API response format:', response.data);
      products = [];
    }
    
    // Create synthetic pagination metadata
    // If we get fewer products than the limit, assume it's the last page
    const hasMorePages = products.length >= limit; 
    
    return {
      data: products,
      meta: {
        total: (page * limit) + (hasMorePages ? limit : 0), // Estimate total based on current page
        current_page: page,
        last_page: hasMorePages ? page + 1 : page // If we got a full page of results, there might be more
      }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getProductById(productId: string): Promise<Product.Medicine> {
  const response = await axios.get(`/api/dashboard/products/${productId}`);

  if (response.status !== 200) {
    throw new Error('Failed to fetch product details');
  }
  
  return response.data.data;
}

export async function updateProduct(productId: string, formData: FormData): Promise<any> {
  const response = await axios.put(`/api/dashboard/products/${productId}`, formData);

  if (response.status !== 200) {
    throw new Error('Failed to update product');
  }
  
  return response.data;
}

export async function getMainCategories(): Promise<Category.Category[]> {
  const response = await axios.get('/api/categories/main');

  if (response.status !== 200) {
    throw new Error('Failed to fetch main categories');
  }
  
  return response.data.data;
}

export async function getSubCategories(categoryId: string): Promise<Category.Category[]> {
  const response = await axios.get(`/api/categories/${categoryId}/subcategories`);

  if (response.status !== 200) {
    throw new Error('Failed to fetch subcategories');
  }
  
  return response.data.data;
}

export async function getNotifications(skip: number = 0, limit: number = 3, locale: string): Promise<Dashboard.NotificationResponse> {
  const response = await axios.get('/api/notifications', {
    params: {
      skip,
      limit,
    },
    headers: {
      'Accept-Language': locale
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch notifications');
  }

  return response.data as Dashboard.NotificationResponse;
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  console.log(`Marking notification ${notificationId} as read...`);
  const response = await axios.patch(`/api/notifications/${notificationId}/read`);

  if (response.status !== 200) {
    throw new Error('Failed to mark notification as read');
  }
  console.log(`Notification ${notificationId} marked as read successfully`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  console.log("Marking all notifications as read...");
  const response = await axios.patch('/api/notifications/mark-all-read');

  if (response.status !== 200) {
    throw new Error('Failed to mark all notifications as read');
  }
  console.log("All notifications marked as read successfully");
}