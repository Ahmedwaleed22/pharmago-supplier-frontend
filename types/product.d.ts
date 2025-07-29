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
    // tag: {
    //   color: string;
    //   title: string;
    // };
    tag: string;
    stock: string|number;
    in_stock: boolean;
    currency: {
      id: number;
      name: string;
      code: string;
    };
    is_whitelisted: boolean;
    category: Category.Category;
  }

  export interface Currency {
    id: number;
    country_id: number;
    name: string;
    code: string;
    precision: number;
    symbol: string;
    symbol_native: string;
    symbol_first: boolean;
    decimal_mark: string;
    thousands_separator: string;
    exchange_rate: string;
    is_default: boolean;
    is_active: boolean;
  }

  export interface Tag {
    color: string;
    title: string;
  }
}
