declare module Dashboard {
  interface Client {
    id: string;
    name: string;
    avatar: string | null;
    type: string;
  }
  
  export interface OrderHistoryItem {
    id: string;
    user: Client;
    request: string;
    status: string;
    start_date: string;
    tracking_id: string;
  }

  export interface OrderHistoryResponse {
    message: string;
    data: {
      orders: DeliveryOrder[];
      pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
      };
      stats: {
        total_orders: number;
        delivered_orders: number;
        active_orders: number;
        canceled_orders: number;
        delivery_success_rate: number;
        total_revenue: number;
        total_delivery_fees: number;
        average_delivery_time_minutes: number;
      };
    };
  }

  export interface DeliveryOrder {
    id: string;
    user_id: string;
    subtotal: string;
    delivery_fees: string;
    discount: string;
    total: string;
    status: string;
    payment_status: string;
    payment_method: string;
    order_type: string;
    shipping_type: string | null;
    estimated_delivery_time: string | null;
    is_rated: boolean;
    can_be_rated: boolean;
    created_at: string;
    updated_at: string;
    user: {
      name: string;
      avatar: string | null;
      account_type: string;
    };
    shipping_address: {
      id: string;
      address: string;
      full_address: string;
      city: string;
      province: string;
      country: string;
      label: string;
      phone_number: string;
      latitude: string;
      longitude: string;
      is_primary: boolean;
    };
    items: DeliveryOrderItem[];
  }

  export interface DeliveryOrderItem {
    id: string;
    order_id: string;
    orderable_id: string;
    orderable_type: string;
    quantity: number;
    unit_price: string;
    discount_percentage: string;
    subtotal: string;
    metadata: any;
    created_at: string;
    updated_at: string;
    orderable: {
      id: string;
      name: string;
      image: string;
      images: string[];
      details: string;
      price: string;
      discount_percentage: string;
      discounted_price: string;
      description: string;
      rating: string;
      tag: string[];
      stock: number;
      in_stock: boolean;
      currency: {
        id: number;
        name: string;
        code: string;
      };
    };
  }
  
  export interface GrossVolumeData {
    trend: {
      date: string;
      revenue: number;
    }[];
    growth: number;
    growth_direction: "up" | "down" | "neutral";
    current_revenue: number;
    current_month: string;
    data: {
      date: string;
      revenue: number;
    }[];
  }
  
  export interface StatisticCard {
    count: number;
    trend: number;
    trend_direction: "up" | "down" | "neutral";
  }
  
  export interface Analytics {
    period: string;
    cards: {
      orders: StatisticCard;
      prescriptions: StatisticCard;
      sales: StatisticCard;
      deliveries: StatisticCard;
      visits: StatisticCard;
    };
    gross_volume: GrossVolumeData;
    orders_history: OrderHistoryItem[];
    pharmacy: Auth.Pharmacy;
    medicine_count: number;
    new_clients: StatisticCard;
  }

  export interface Products {
    products: Product[];
  }

  export interface Product {
    id: string;
    name: string;
  }

  export interface Notification {
    id: string;
    user_id: string;
    title: string;
    logo: string | null;
    short_description: string;
    description: string;
    link: string;
    type: string;
    category: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface NotificationResponse {
    data: Notification[];
    meta: {
      unread_count: number;
      total?: number;
      has_more?: boolean;
    };
  }
}