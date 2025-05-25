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
  }
  
  export interface GrossVolumeData {
    trend: {
      date: string;
      revenue: number;
    }[];
    growth: number;
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
    new_clients_count: number;
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