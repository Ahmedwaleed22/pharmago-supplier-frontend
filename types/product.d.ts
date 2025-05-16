declare module Product {
  export interface Medicine {
    id: string;
    name: string;
    image: string;
    details: string;
    price: string|number;
    discount_percentage: string|number;
    discounted_price: string|number;
    description: string;
    rating: string|number;
    notes: string;
    tag: {
      color: string;
      title: string;
    };
    stock: string|number;
    in_stock: boolean;
    currency: {
      id: number;
      name: string;
      code: string;
    };
    is_whitelisted: boolean;
  }
}
