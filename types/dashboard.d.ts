declare module Dashboard {
  interface Client {
    id: string;
    name: string;
    avatar: string | null;
    type: string;
  }

  interface OrderHistoryItem {
    id: string;
    user: Client;
    request: string;
    status: string;
    start_date: string;
    tracking_id: string;
    type?: 'order' | 'prescription';
    prescription_text?: string;
    file_path?: string;
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
    is_expired: boolean;
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

  export interface StatisticCard {
    count: number;
    trend: number;
    trend_direction: "up" | "down" | "neutral";
  }

  export interface GrossVolumeData {
    trend: number;
    growth: number;
    growth_direction: "up" | "down" | "neutral";
    current_revenue: number;
    current_month: string;
    data: {
      date: string;
      revenue: number;
    }[];
  }

  export interface RevenueBreakdown {
    total_revenue: number;
    total_subtotal: number;
    total_delivery_fees: number;
    total_service_fees: number;
    total_discounts: number;
    prescription_revenue: number;
    cart_revenue: number;
    daily_revenue: {
      [key: string]: {
        revenue: number;
        orders: number;
        average_order_value: number;
      };
    };
    revenue_breakdown: {
      product_sales: number;
      delivery_fees: number;
      service_fees: number;
      discounts_given: number;
    };
  }

  export interface AverageOrderMetrics {
    average_order_value: number;
    average_items_per_order: number;
    average_delivery_time_hours: number;
    average_discount_per_order: number;
    average_delivery_fee: number;
  }

  export interface OrderStatusDistribution {
    distribution: {
      pending: { count: number; percentage: number };
      processing: { count: number; percentage: number };
      shipping: { count: number; percentage: number };
      delivered: { count: number; percentage: number };
      canceled: { count: number; percentage: number };
    };
    total_orders: number;
    completion_rate: number;
    cancellation_rate: number;
  }

  export interface DeliveryPerformance {
    total_orders: number;
    delivered_orders: number;
    shipping_orders: number;
    processing_orders: number;
    on_time_delivery_rate: number;
    average_acceptance_time_minutes: number;
    average_delivery_time_hours: number;
  }

  export interface PrescriptionDeliverySuccess {
    total_prescriptions: number;
    successful_deliveries: number;
    prescriptions_with_offers: number;
    prescriptions_with_orders: number;
    success_rate: number;
    engagement_rate: number;
    conversion_rate: number;
    failed_deliveries: number;
  }

  export interface PrescriptionToOrderConversion {
    total_prescriptions: number;
    prescriptions_with_offers: number;
    prescriptions_with_orders: number;
    offer_rate: number;
    conversion_rate: number;
  }

  export interface TopSellingProduct {
    id: string;
    name: string;
    image: string;
    category: string;
    total_sales: number;
    units_sold: number;
    revenue: number;
    average_rating: number;
  }

  export interface ProductSalesAnalytics {
    total_products: number;
    products_with_sales: number;
    products_without_sales: number;
    sales_coverage_rate: number;
    category_sales: Array<{
      category: string;
      sales_count: number;
      revenue: number;
    }>;
    low_stock_products: number;
    out_of_stock_products: number;
  }

  export interface InventoryPerformance {
    total_products: number;
    products_with_sales: number;
    products_without_sales: number;
    inventory_turnover_rate: number;
    fast_moving_products: number;
    slow_moving_products: number;
  }

  export interface CustomerSatisfaction {
    total_ratings: number;
    average_rating: number;
    rating_distribution: {
      "1": { count: number; percentage: number };
      "2": { count: number; percentage: number };
      "3": { count: number; percentage: number };
      "4": { count: number; percentage: number };
      "5": { count: number; percentage: number };
    };
    satisfaction_rate: number;
    recent_reviews: Array<{
      id: string;
      user_name: string;
      rating: number;
      comment: string;
      created_at: string;
    }>;
  }

  export interface CustomerRetention {
    total_customers: number;
    repeat_customers: number;
    new_customers: number;
    repeat_customer_rate: number;
    customer_lifetime_value: number;
  }

  export interface GeographicalAnalytics {
    orders_by_location: Array<{
      city: string;
      order_count: number;
      total_revenue: number;
      average_order_value: number;
    }>;
    total_cities_served: number;
  }

  export interface TimeBasedAnalytics {
    orders_by_hour: {
      [key: string]: {
        count: number;
        revenue: number;
      };
    };
    orders_by_day_of_week: {
      [key: string]: {
        count: number;
        revenue: number;
      };
    };
    peak_hour: string;
    peak_day: string;
  }

  export interface CompetitiveMetrics {
    market_share: number;
    ranking: number;
    total_pharmacies_in_market: number;
    orders_vs_market_average: number;
  }

  export interface Summary {
    total_revenue: number;
    total_orders: number;
    success_rate: number;
    average_rating: number;
    repeat_customer_rate: number;
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
    revenue_breakdown: RevenueBreakdown;
    average_order_metrics: AverageOrderMetrics;
    order_status_distribution: OrderStatusDistribution;
    delivery_performance: DeliveryPerformance;
    prescription_delivery_success: PrescriptionDeliverySuccess;
    prescription_to_order_conversion: PrescriptionToOrderConversion;
    top_selling_products: TopSellingProduct[];
    product_sales_analytics: ProductSalesAnalytics;
    inventory_performance: InventoryPerformance;
    customer_satisfaction: CustomerSatisfaction;
    customer_retention: CustomerRetention;
    geographical_analytics: GeographicalAnalytics;
    time_based_analytics: TimeBasedAnalytics;
    competitive_metrics: CompetitiveMetrics;
    summary: Summary;
  }

  export interface Sales {
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
    revenue_breakdown: RevenueBreakdown;
    average_order_metrics: AverageOrderMetrics;
    order_status_distribution: OrderStatusDistribution;
    delivery_performance: DeliveryPerformance;
    prescription_delivery_success: PrescriptionDeliverySuccess;
    prescription_to_order_conversion: PrescriptionToOrderConversion;
    top_selling_products: TopSellingProduct[];
    product_sales_analytics: ProductSalesAnalytics;
    inventory_performance: InventoryPerformance;
    customer_satisfaction: CustomerSatisfaction;
    customer_retention: CustomerRetention;
    geographical_analytics: GeographicalAnalytics;
    time_based_analytics: TimeBasedAnalytics;
    competitive_metrics: CompetitiveMetrics;
    summary: Summary;
  }

  export interface Products {
    products: Product[];
  }

  export interface Product {
    id: string;
    name: string;
    image: string;
    details: string;
    price: number;
    discount_percentage: number;
    discounted_price: number;
    description: string;
    rating: number;
    notes: string;
    tag: string;
    stock: number;
    in_stock: boolean;
    currency: {
      id: number;
      name: string;
      code: string;
    };
    is_whitelisted: boolean;
    category: Category.Category;
  }
}