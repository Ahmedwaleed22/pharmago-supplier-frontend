"use client";

import { useRouter, useParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  Paperclip,
  Send,
  MapPin,
  Mail,
  User,
  MoreHorizontal,
  Package,
  Ruler,
  Weight,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { chatService, ChatMessage, ChatConversation } from "@/services/chatService";
import useAuth from "@/hooks/useAuth";
import { useChatPusher } from "@/hooks/useChatPusher";

function ChatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Load conversations on component mount (only if authenticated and not already loaded)
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading && !conversationsLoaded) {
      loadConversations();
    }
  }, [isAuthenticated, isAuthLoading, conversationsLoaded]);

  // Update active conversation when URL params change
  useEffect(() => {
    const conversationId = params.conversationId as string;
    if (conversationId && conversations.length > 0) {
      const [buyerId, medicineId] = conversationId.split("-");
      const conversation = conversations.find(
        (conv) => conv.buyer_id === buyerId && conv.medicine_id === medicineId
      );
      if (conversation) {
        // Always update to ensure state is in sync with URL
        setActiveConversation(conversation);
      }
    }
  }, [params.conversationId, conversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.buyer_id, activeConversation.medicine_id);
    }
  }, [activeConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for real-time messages via Pusher
  useChatPusher({
    supplierId: user?.id || '',
    buyerId: activeConversation?.buyer_id || '',
    medicineId: activeConversation?.medicine_id || '',
    onNewMessage: (newMessage: ChatMessage) => {
      console.log('Received new message via Pusher:', newMessage);
      
      // Only add the message if it's for the current conversation
      if (
        activeConversation &&
        newMessage.supplier_id === activeConversation.supplier_id &&
        newMessage.buyer_id === activeConversation.buyer_id &&
        newMessage.medicine_id === activeConversation.medicine_id
      ) {
        // Check if message already exists (avoid duplicates)
        setMessages((prevMessages) => {
          const exists = prevMessages.some((msg) => msg.id === newMessage.id);
          if (!exists) {
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });
      }
      
      // Update conversations to reflect the new last message
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (
            conv.supplier_id === newMessage.supplier_id &&
            conv.buyer_id === newMessage.buyer_id &&
            conv.medicine_id === newMessage.medicine_id
          ) {
            return {
              ...conv,
              last_message: {
                id: newMessage.id,
                message: newMessage.message,
                message_type: newMessage.message_type,
                sender_name: newMessage.sender.name,
                is_sent_by_me: newMessage.sender_id === user?.id,
                created_at: newMessage.created_at,
              },
              updated_at: newMessage.created_at,
            };
          }
          return conv;
        });
      });
    },
    enabled: !!(
      activeConversation &&
      user?.id &&
      activeConversation.supplier_id === user.id
    ),
  });

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const selectConversation = (conversation: ChatConversation) => {
    console.log("selectConversation called with:", conversation);
    
    // Use buyer_id-medicine_id combination as the conversation ID
    const conversationId = `${conversation.buyer_id}-${conversation.medicine_id}`;
    const currentConversationId = params.conversationId as string;

    console.log("Selecting conversation:", {
      conversation,
      supplier_id: conversation.supplier_id,
      buyer_id: conversation.buyer_id,
      medicine_id: conversation.medicine_id,
      buyer_id_from_object: conversation.buyer?.id,
      medicine_id_from_object: conversation.medicine?.id,
      generated_conversation_id: conversationId,
      current_conversation_id: currentConversationId,
    });

    // Always navigate to ensure URL is updated and useEffect triggers
    router.push(`/dashboard/chat/${conversationId}`, { scroll: false });
  };

  const loadConversations = async (forceReload = false) => {
    // Don't reload if already loaded and not forcing
    if (conversationsLoaded && !forceReload) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await chatService.getConversations();
      console.log("Loaded conversations:", response.data.conversations);
      console.log("First conversation details:", response.data.conversations[0]);
      if (response.data.conversations[0]) {
        console.log("First conversation IDs:", {
          supplier_id: response.data.conversations[0].supplier_id,
          buyer_id: response.data.conversations[0].buyer_id,
          medicine_id: response.data.conversations[0].medicine_id,
          buyer: response.data.conversations[0].buyer,
          medicine: response.data.conversations[0].medicine,
        });
      }
      setConversations(response.data.conversations);

      // Check if there's a conversation ID in the URL path
      const conversationId = params.conversationId as string;
      console.log("URL conversation ID:", conversationId);
      if (conversationId && response.data.conversations.length > 0) {
        // Parse buyer_id and medicine_id from the conversation ID
        const [buyerId, medicineId] = conversationId.split("-");
        console.log("Parsed IDs:", { buyerId, medicineId });
        
        // Find conversation by buyer_id and medicine_id
        const conversation = response.data.conversations.find(
          (conv) =>
            conv.buyer_id === buyerId && conv.medicine_id === medicineId
        );
        console.log("Found conversation:", conversation);
        
        if (conversation) {
          setActiveConversation(conversation);
        } else {
          // If conversation not found, select the first one
          console.log("Conversation not found, selecting first one");
          setActiveConversation(response.data.conversations[0]);
        }
      } else if (response.data.conversations.length > 0) {
        // Select the first conversation if no URL parameter
        setActiveConversation(response.data.conversations[0]);
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError("Failed to load conversations. Please try again.");
    } finally {
      setLoading(false);
      setConversationsLoaded(true);
    }
  };

  const loadMessages = async (buyerId: string, medicineId: string) => {
    try {
      const response = await chatService.getMessages(buyerId, medicineId);
      setMessages(response.data.messages.reverse()); // Reverse to show oldest first
      // Scroll to bottom after loading messages
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      setError("Failed to load messages");
      console.error("Error loading messages:", err);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() && activeConversation) {
      try {
        await chatService.sendMessage({
          buyer_id: activeConversation.buyer_id,
          medicine_id: activeConversation.medicine_id,
          message: message.trim(),
          message_type: "text",
        });
        setMessage("");
        // Reload messages to show the new message
        await loadMessages(
          activeConversation.buyer_id,
          activeConversation.medicine_id
        );
        // Scroll to bottom after sending message
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        setError("Failed to send message");
        console.error("Error sending message:", err);
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getDisplayMessage = (msg: ChatMessage) => {
    switch (msg.message_type) {
      case "image":
        return "📷 Photo";
      case "offer":
      case "counter_offer":
        return "💰 " + msg.message;
      case "acceptance":
        return "✅ Offer accepted";
      case "rejection":
        return "❌ Offer rejected";
      default:
        return msg.message;
    }
  };

  // Show loading while checking authentication
  if (isAuthLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-10">
        <div className="flex h-[600px] p-4">
          {/* Left Panel - Conversations Skeleton */}
          <div className="w-80 bg-white border-r border-gray-200 p-4 pl-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Chat Skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 pt-2 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 pb-2 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-10">
        <div className="flex h-[600px] p-4">
          {/* Left Panel - Conversations Skeleton */}
          <div className="w-80 bg-white border-r border-gray-200 p-4 pl-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Chat Skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 pt-2 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 pb-2 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => loadConversations(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no conversations
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No conversations yet
          </h3>
          <p className="text-gray-500 mb-4">
            You don't have any chat conversations with buyers yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-10">
      <div className="flex h-[600px] p-4">
        {/* Left Panel - Recent Chats */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 pl-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Chats
          </h3>
          <div className="space-y-3">
            {conversations.map((conversation) => {
              const conversationId = `${conversation.buyer_id}-${conversation.medicine_id}`;
              const currentConversationId = params.conversationId as string;
              const isActive = conversationId === currentConversationId;
              
              return (
              <div
                key={`${conversation.buyer_id}-${conversation.medicine_id}`}
                className={`p-3 pl-0 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <Package className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {conversation.buyer.name}
                    </p>
                    <p className="text-xs text-blue-600 truncate font-medium">
                      {conversation.medicine.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {conversation.last_message?.message || "No messages yet"}
                    </p>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        </div>

        {/* Center Panel - Active Chat */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 pt-2 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {activeConversation.buyer.name}
                      </h4>
                      <p className="text-xs text-blue-600 font-medium">
                        {activeConversation.medicine.name}
                      </p>
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-all duration-300 cursor-pointer">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                      className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-all duration-300 cursor-pointer"
                    >
                      {isRightPanelOpen ? (
                        <ChevronRight className="w-5 h-5" />
                      ) : (
                        <ChevronLeft className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id}>
                      {msg.message_type === "shipment_dimensions" ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md">
                          <h5 className="font-medium text-green-800 mb-3">
                            Shipment Dimensions
                          </h5>
                          <div className="text-xs text-green-700 mb-2">
                            Product ID: {activeConversation.medicine_id}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center space-x-2">
                              <Weight className="w-4 h-4 text-green-600" />
                              <span>Weight: {msg.metadata?.weight || "N/A"}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Ruler className="w-4 h-4 text-green-600" />
                              <span>Length: {msg.metadata?.length || "N/A"}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Ruler className="w-4 h-4 text-green-600" />
                              <span>Width: {msg.metadata?.width || "N/A"}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Ruler className="w-4 h-4 text-green-600" />
                              <span>Height: {msg.metadata?.height || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      ) : msg.message_type === "image" ? (
                        <div
                          className={`flex ${
                            msg.sender_id === activeConversation.supplier_id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-md px-4 py-2 rounded-lg ${
                              msg.sender_id === activeConversation.supplier_id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            <img
                              src={msg.image_url || "/placeholder-image.jpg"}
                              alt="Shared image"
                              className="max-w-full h-auto rounded"
                            />
                            <p className="text-sm mt-2">{getDisplayMessage(msg)}</p>
                            <p
                              className={`text-xs mt-1 ${
                                msg.sender_id === activeConversation.supplier_id
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatTimestamp(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`flex ${
                            msg.sender_id === activeConversation.supplier_id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-md px-4 py-2 rounded-lg ${
                              msg.sender_id === activeConversation.supplier_id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            <p className="text-md">{getDisplayMessage(msg)}</p>
                            <p
                              className={`text-xs mt-1 ${
                                msg.sender_id === activeConversation.supplier_id
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatTimestamp(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 pb-2 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-primary hover:text-primary hover:bg-gray-100 rounded-lg">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    className={`p-2 rounded-lg transition-all duration-300 hover:bg-blue-600 hover:text-white cursor-pointer ${
                      message.trim()
                        ? "bg-blue-600 text-white"
                        : "bg-transparent text-gray-700"
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No conversation selected
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the left panel to start chatting
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Buyer Details */}
        {isRightPanelOpen && activeConversation && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 pr-2 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsRightPanelOpen(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-gray-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">
                {activeConversation.buyer.name}
              </h4>
              <p className="text-sm text-gray-600">
                {activeConversation.buyer.account_type} . Online
              </p>
            </div>

            <div className="flex space-x-2 mb-6">
              <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-gray-200 text-primary rounded-lg hover:bg-gray-300">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">Call</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-gray-200 text-primary rounded-lg hover:bg-gray-300">
                <User className="w-4 h-4" />
                <span className="font-medium text-sm">Open Profile</span>
              </button>
            </div>

            <div className="mb-6">
              <h5 className="font-medium text-gray-900 mb-3">Product Details</h5>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {activeConversation.medicine.name}
                  </span>
                </div>
                {activeConversation.medicine.image && (
                  <div className="flex justify-center">
                    <img
                      src={activeConversation.medicine.image}
                      alt={activeConversation.medicine.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-3">Buyer Details</h5>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-primary">
                    Contact buyer for details
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-primary">
                    Contact buyer for details
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-primary">
                    Contact buyer for details
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatDetailPage;

