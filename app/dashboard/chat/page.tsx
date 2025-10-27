"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { User, Package } from "lucide-react";
import { chatService, ChatConversation, ChatMessage } from "@/services/chatService";
import useAuth from "@/hooks/useAuth";
import { subscribeToChatChannel, unsubscribeFromChatChannel, getPusherInstance } from "@/services/pusher";

function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelsRef = useRef<Record<string, any>>({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Load conversations on component mount (only if authenticated)
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      loadConversations();
    }
  }, [isAuthenticated, isAuthLoading]);

  // Listen for real-time updates on all conversation channels
  useEffect(() => {
    if (!user?.id || !isAuthenticated || conversations.length === 0) {
      return;
    }

    console.log('Setting up Pusher listeners for all conversations');

    // Subscribe to all conversation channels
    conversations.forEach((conv) => {
      const channelName = `supplier-chat.${conv.supplier_id}.${conv.buyer_id}.${conv.medicine_id}`;
      
      if (!channelsRef.current[channelName]) {
        const channel = subscribeToChatChannel(
          conv.supplier_id,
          conv.buyer_id,
          conv.medicine_id
        );

        if (channel) {
          channelsRef.current[channelName] = channel;

          // Listen for new messages
          channel.bind('new_message', (data: ChatMessage) => {
            console.log('Received new message in conversations list:', data);
            
            // Update the conversation list with the new last message
            setConversations((prevConversations) => {
              return prevConversations.map((convItem) => {
                if (
                  convItem.supplier_id === data.supplier_id &&
                  convItem.buyer_id === data.buyer_id &&
                  convItem.medicine_id === data.medicine_id
                ) {
                  return {
                    ...convItem,
                    last_message: {
                      id: data.id,
                      message: data.message,
                      message_type: data.message_type,
                      sender_name: data.sender.name,
                      is_sent_by_me: data.sender_id === user?.id,
                      created_at: data.created_at,
                    },
                    updated_at: data.created_at,
                    // Increment unread count if message is not from current user
                    unread_count: data.sender_id === user?.id 
                      ? convItem.unread_count 
                      : convItem.unread_count + 1,
                  };
                }
                return convItem;
              });
            });
          });
        }
      }
    });

    // Cleanup function
    return () => {
      console.log('Cleaning up conversation Pusher listeners');
      Object.keys(channelsRef.current).forEach((channelName) => {
        const channel = channelsRef.current[channelName];
        if (channel) {
          channel.unbind_all();
        }
      });
      
      // Unsubscribe from all channels
      conversations.forEach((conv) => {
        unsubscribeFromChatChannel(
          conv.supplier_id,
          conv.buyer_id,
          conv.medicine_id
        );
      });

      channelsRef.current = {};
    };
  }, [conversations, user?.id, isAuthenticated]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatService.getConversations();
      console.log(
        "Supplier chat - Loaded conversations:",
        response.data.conversations
      );
      console.log(
        "Supplier chat - First conversation details:",
        response.data.conversations[0]
      );
      if (response.data.conversations[0]) {
        console.log("Supplier chat - First conversation IDs:", {
          supplier_id: response.data.conversations[0].supplier_id,
          buyer_id: response.data.conversations[0].buyer_id,
          medicine_id: response.data.conversations[0].medicine_id,
          buyer: response.data.conversations[0].buyer,
          medicine: response.data.conversations[0].medicine,
        });
      }
      setConversations(response.data.conversations);

      // If there are conversations, redirect to the first one
      if (response.data.conversations.length > 0) {
        const firstConversation = response.data.conversations[0];
        const conversationId = `${firstConversation.buyer_id}-${firstConversation.medicine_id}`;
        console.log("Supplier chat - Redirecting to first conversation:", {
          firstConversation,
          conversationId,
        });
        router.push(`/dashboard/chat/${conversationId}`);
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError("Failed to load conversations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = (conversation: ChatConversation) => {
    // Use buyer_id-medicine_id combination as the conversation ID
    const conversationId = `${conversation.buyer_id}-${conversation.medicine_id}`;
    console.log("Supplier chat - Selecting conversation:", {
      conversation,
      supplier_id: conversation.supplier_id,
      buyer_id: conversation.buyer_id,
      medicine_id: conversation.medicine_id,
      buyer_id_from_object: conversation.buyer?.id,
      medicine_id_from_object: conversation.medicine?.id,
      generated_conversation_id: conversationId,
    });
    router.push(`/dashboard/chat/${conversationId}`);
  };

  // Show loading while checking authentication
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
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
            onClick={loadConversations}
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

  // Show conversation list if there are conversations but we're not redirecting
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Your Conversations
        </h2>
        <div className="grid gap-4">
          {conversations.map((conversation) => (
            <div
              key={`${conversation.buyer_id}-${conversation.medicine_id}`}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => selectConversation(conversation)}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Package className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conversation.buyer.name}
                    </h3>
                    {conversation.unread_count > 0 && (
                      <span className="inline-block bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-blue-600 font-medium truncate">
                    {conversation.medicine.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.last_message?.message || "No messages yet"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
