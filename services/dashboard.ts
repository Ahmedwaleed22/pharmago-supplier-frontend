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

export async function getDashboardProducts(categoryId: string, subCategoryId: string, searchTerm: string): Promise<Product.Medicine[]> {
  console.log(categoryId, subCategoryId, searchTerm);
  const response = await axios.get('/api/dashboard/products', {
    params: {
      category_id: subCategoryId || categoryId,
      search: searchTerm
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch dashboard products');
  }
  
  return response.data.data;
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