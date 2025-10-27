import axios from "axios";

export interface ChatMessage {
  id: string;
  supplier_id: string;
  buyer_id: string;
  medicine_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  message_type:
    | "text"
    | "image"
    | "offer"
    | "counter_offer"
    | "shipment_dimensions"
    | "acceptance"
    | "rejection"
    | "re_deal";
  metadata: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  sender: {
    id: string;
    name: string;
    account_type: string;
    avatar?: string;
  };
  display_message?: string;
  image_url?: string;
  offer_details?: {
    quantity: number;
    offered_price: number;
    total_price: number;
  };
}

export interface ChatConversation {
  supplier_id: string;
  buyer_id: string;
  medicine_id: string;
  buyer: {
    id: string;
    name: string;
    avatar?: string;
    account_type: string;
  };
  medicine: {
    id: string;
    name: string;
    image?: string;
    price_tiers: any[];
  };
  last_message?: {
    id: string;
    message: string;
    message_type: string;
    sender_name: string;
    is_sent_by_me: boolean;
    created_at: string;
  };
  unread_count: number;
  pusher_channel: string;
  updated_at: string;
}

export interface SendMessageRequest {
  buyer_id: string;
  medicine_id: string;
  message?: string;
  message_type:
    | "text"
    | "image"
    | "offer"
    | "counter_offer"
    | "shipment_dimensions"
    | "acceptance"
    | "rejection"
    | "re_deal";
  offer_data?: {
    quantity: number;
    offered_price: number;
    shipment_dimensions?: any;
    notes?: string;
  };
  image?: File;
  offer_id?: string;
}

export interface MarkAsReadRequest {
  buyer_id: string;
  medicine_id: string;
  message_ids?: string[];
}

class ChatService {
  /**
   * Get all chat conversations for the supplier
   */
  async getConversations(): Promise<{
    success: boolean;
    data: { conversations: ChatConversation[]; total_unread: number };
  }> {
    const response = await axios.get("/api/chat/conversations");
    return response.data;
  }

  /**
   * Get messages for a specific conversation
   */
  async getMessages(
    buyerId: string,
    medicineId: string,
    page = 1,
    perPage = 50
  ): Promise<{
    success: boolean;
    data: {
      messages: ChatMessage[];
      pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        has_more_pages: boolean;
      };
    };
  }> {
    const response = await axios.get(
      `/api/chat/${buyerId}/${medicineId}/messages`,
      {
        params: { page, per_page: perPage },
      }
    );
    return response.data;
  }

  /**
   * Send a message
   */
  async sendMessage(
    messageData: SendMessageRequest
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      chat_message: ChatMessage;
      pusher_channel: string;
    };
  }> {
    const formData = new FormData();

    // Add basic fields
    formData.append("buyer_id", messageData.buyer_id);
    formData.append("medicine_id", messageData.medicine_id);
    formData.append("message_type", messageData.message_type);

    if (messageData.message) {
      formData.append("message", messageData.message);
    }

    if (messageData.offer_data) {
      formData.append("offer_data", JSON.stringify(messageData.offer_data));
    }

    if (messageData.image) {
      formData.append("image", messageData.image);
    }

    if (messageData.offer_id) {
      formData.append("offer_id", messageData.offer_id);
    }

    const response = await axios.post("/api/chat/send", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  /**
   * Accept an offer from buyer
   */
  async acceptOffer(offerId: string): Promise<{
    success: boolean;
    message: string;
    data: { offer: any };
  }> {
    const response = await axios.post(
      `/api/chat/offers/${offerId}/accept`,
      {}
    );
    return response.data;
  }

  /**
   * Reject an offer from buyer
   */
  async rejectOffer(
    offerId: string,
    reason?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await axios.post(
      `/api/chat/offers/${offerId}/reject`,
      {
        reason,
      }
    );
    return response.data;
  }

  /**
   * Mark messages as read
   */
  async markAsRead(
    request: MarkAsReadRequest
  ): Promise<{
    success: boolean;
    message: string;
    data: { updated_count: number };
  }> {
    const response = await axios.post("/api/chat/mark-read", request);
    return response.data;
  }
}

export const chatService = new ChatService();

