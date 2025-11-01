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
  Loader2,
} from "lucide-react";
import { chatService, ChatMessage, ChatConversation } from "@/services/chatService";
import useAuth from "@/hooks/useAuth";
import { useChatPusher } from "@/hooks/useChatPusher";
import { subscribeToChatChannel, unsubscribeFromChatChannel } from "@/services/pusher";
import {
  playNotificationSound,
  flashBrowserTitle,
  clearTitleFlash,
  initializeTitle,
  calculateUnreadCount,
} from "@/utils/notifications";

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
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerQuantity, setOfferQuantity] = useState(1);
  const [offerPrice, setOfferPrice] = useState("");
  const [sendingOffer, setSendingOffer] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Initialize title tracking
  useEffect(() => {
    initializeTitle();
    return () => {
      clearTitleFlash();
    };
  }, []);

  // Update browser title when conversations change
  useEffect(() => {
    const totalUnread = calculateUnreadCount(conversations);
    if (totalUnread > 0) {
      flashBrowserTitle(totalUnread);
    } else {
      clearTitleFlash();
    }
  }, [conversations]);

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
    console.log("🔍 URL conversationId:", conversationId);
    console.log("📋 Available conversations:", conversations.map(c => ({ 
      buyerId: c.buyer_id, 
      medicineId: c.medicine_id,
      expectedFormat: `${c.buyer_id}__${c.medicine_id}`
    })));
    
    if (conversationId && conversations.length > 0) {
      let buyerId: string | undefined;
      let medicineId: string | undefined;
      
      // Try new separator first (double underscore)
      if (conversationId.includes("__")) {
        [buyerId, medicineId] = conversationId.split("__");
        console.log("✂️ Using new __ separator:", { buyerId, medicineId });
      } 
      // Fall back to old separator (last hyphen) for backward compatibility
      else if (conversationId.includes("-")) {
        // UUIDs are 36 chars (32 chars + 4 hyphens), so split at the last hyphen before the last UUID
        const parts = conversationId.split("-");
        // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (8-4-4-4-12)
        // So we need to find where first UUID ends and second begins
        // This is tricky, so let's use a different approach: 
        // Find the last occurrence of a UUID pattern
        const uuidPattern = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
        const match = conversationId.match(uuidPattern);
        if (match) {
          buyerId = match[1];
          medicineId = match[2];
          console.log("✂️ Using old - separator (backward compatibility):", { buyerId, medicineId });
        } else {
          console.warn("⚠️ Could not parse old format conversationId");
        }
      }
      
      if (buyerId && medicineId) {
        const conversation = conversations.find(
          (conv) => conv.buyer_id === buyerId && conv.medicine_id === medicineId
        );
        console.log("🎯 Found conversation:", conversation);
        
        if (conversation) {
          // Always update to ensure state is in sync with URL
          setActiveConversation(conversation);
        } else {
          console.warn("⚠️ Conversation not found, URL might be malformed");
        }
      } else {
        console.warn("⚠️ Could not parse buyerId and medicineId from URL");
      }
    }
  }, [params.conversationId, conversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation && user?.id) {
      // Clear old messages and show loading state when switching conversations
      setMessages([]);
      setLoadingMessages(true);
      // Only reload conversations on initial load, not on subsequent updates
      loadMessages(activeConversation.buyer_id, activeConversation.medicine_id, true);
    }
  }, [activeConversation?.buyer_id, activeConversation?.medicine_id, user?.id]);

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
      
      // Play sound and flash title if message is not from current user
      const isFromCurrentUser = newMessage.sender_id === user?.id;
      const isActiveConversation =
        activeConversation &&
        newMessage.supplier_id === activeConversation.supplier_id &&
        newMessage.buyer_id === activeConversation.buyer_id &&
        newMessage.medicine_id === activeConversation.medicine_id;

      if (!isFromCurrentUser) {
        // Play notification sound if not from current user
        playNotificationSound();

        // Flash title if not viewing this conversation or tab is not active
        if (!isActiveConversation || document.hidden) {
          // Update conversations first to get accurate unread count
          setConversations((prevConversations) => {
            const updated = prevConversations.map((conv) => {
              if (
                conv.buyer_id === newMessage.buyer_id &&
                conv.medicine_id === newMessage.medicine_id
              ) {
                return {
                  ...conv,
                  unread_count: conv.unread_count + 1,
                };
              }
              return conv;
            });
            const totalUnread = calculateUnreadCount(updated);
            flashBrowserTitle(totalUnread);
            return updated;
          });
        }
      }
      
      // Only add the message if it's for the current conversation
      if (isActiveConversation) {
        // Check if message already exists (avoid duplicates)
        setMessages((prevMessages) => {
          const exists = prevMessages.some((msg) => msg.id === newMessage.id);
          if (!exists) {
            // Mark message as read if we're the receiver
            if (newMessage.receiver_id === user?.id && !newMessage.is_read) {
              chatService.markAsRead({
                buyer_id: newMessage.buyer_id,
                medicine_id: newMessage.medicine_id,
                message_ids: [newMessage.id],
              }).then(() => {
                // Update unread count for conversation
                setConversations((prevConversations) =>
                  prevConversations.map((conv) =>
                    conv.buyer_id === newMessage.buyer_id &&
                    conv.medicine_id === newMessage.medicine_id
                      ? {
                          ...conv,
                          unread_count: Math.max(0, conv.unread_count - 1),
                        }
                      : conv
                  )
                );
              }).catch((err) => {
                console.error("Error marking message as read:", err);
              });
            }
            
            // If it's an image message, wait a bit for the image to load before scrolling
            if (newMessage.message_type === 'image') {
              setTimeout(() => {
                scrollToBottom();
                // Extra scroll after image loads
                setTimeout(scrollToBottom, 500);
              }, 100);
            } else {
              // Scroll immediately for text messages
              setTimeout(scrollToBottom, 100);
            }
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });
      }
      
      // Update conversations to reflect the new last message
      setConversations((prevConversations) => {
        const updated = prevConversations.map((conv) => {
          if (
            conv.supplier_id === newMessage.supplier_id &&
            conv.buyer_id === newMessage.buyer_id &&
            conv.medicine_id === newMessage.medicine_id
          ) {
            // Get display message based on message type (match backend format)
            let displayMessage = newMessage.message || '';
            if (newMessage.message_type === 'image') {
              displayMessage = '📷 Photo';
            } else if (newMessage.message_type === 'offer' || newMessage.message_type === 'counter_offer') {
              displayMessage = newMessage.message;
            } else if (newMessage.message_type === 'acceptance') {
              displayMessage = '✅ Offer accepted';
            } else if (newMessage.message_type === 'rejection') {
              displayMessage = '❌ Offer rejected';
            }
            
            return {
              ...conv,
              last_message: {
                id: newMessage.id,
                message: displayMessage,
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
        
        // Sort by updated_at in descending order (most recent first)
        return updated.sort((a, b) => {
          const timeA = new Date(a.updated_at).getTime();
          const timeB = new Date(b.updated_at).getTime();
          return timeB - timeA; // Descending order
        });
      });
    },
    enabled: !!(
      activeConversation &&
      user?.id &&
      activeConversation.supplier_id === user.id
    ),
  });

  // Listen for messages on ALL conversation channels (for unread count updates when outside a conversation)
  useEffect(() => {
    if (!user?.id || !isAuthenticated || conversations.length === 0) {
      return;
    }

    console.log('Setting up Pusher listeners for all conversations in detail page');

    const allChannelsRef: Record<string, any> = {};

    // Subscribe to all conversation channels
    conversations.forEach((conv) => {
      const channelName = `supplier-chat.${conv.supplier_id}.${conv.buyer_id}.${conv.medicine_id}`;

      // Skip if already listening to this channel via useChatPusher
      if (activeConversation && 
          conv.supplier_id === activeConversation.supplier_id &&
          conv.buyer_id === activeConversation.buyer_id &&
          conv.medicine_id === activeConversation.medicine_id) {
        return;
      }

      if (!allChannelsRef[channelName]) {
        const channel = subscribeToChatChannel(
          conv.supplier_id,
          conv.buyer_id,
          conv.medicine_id
        );

        if (channel) {
          allChannelsRef[channelName] = channel;

          // Listen for new messages
          channel.bind('new_message', (data: ChatMessage) => {
            console.log('Received new message in other conversations:', data);

            const isFromCurrentUser = data.sender_id === user?.id;
            const isActiveConversation = 
              activeConversation &&
              activeConversation.supplier_id === data.supplier_id &&
              activeConversation.buyer_id === data.buyer_id &&
              activeConversation.medicine_id === data.medicine_id;

            // Play sound and flash title if message is not from current user and not in active conversation
            if (!isFromCurrentUser && !isActiveConversation) {
              playNotificationSound();
            }

            // If this is the active conversation, mark it as read
            if (
              isActiveConversation &&
              data.receiver_id === user?.id &&
              !data.is_read
            ) {
              chatService.markAsRead({
                buyer_id: data.buyer_id,
                medicine_id: data.medicine_id,
                message_ids: [data.id],
              }).catch((err) => {
                console.error("Error marking message as read:", err);
              });
            }

            // Update the conversation list with the new last message and unread count
            setConversations((prevConversations) => {
              const updated = prevConversations.map((convItem) => {
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
                    // Increment unread count only if message is not from current user and not active conversation
                    unread_count:
                      data.sender_id === user?.id || isActiveConversation
                        ? convItem.unread_count
                        : convItem.unread_count + 1,
                  };
                }
                return convItem;
              });
              
              // Update title flash with new unread count
              const totalUnread = calculateUnreadCount(updated);
              if (totalUnread > 0) {
                flashBrowserTitle(totalUnread);
              } else {
                clearTitleFlash();
              }
              
              // Sort by updated_at in descending order (most recent first)
              return updated.sort((a, b) => {
                const timeA = new Date(a.updated_at).getTime();
                const timeB = new Date(b.updated_at).getTime();
                return timeB - timeA; // Descending order
              });
            });
          });
        }
      }
    });

    // Cleanup function
    return () => {
      console.log('Cleaning up other conversation Pusher listeners');
      Object.keys(allChannelsRef).forEach((channelName) => {
        const channel = allChannelsRef[channelName];
        if (channel) {
          channel.unbind_all();
        }
      });
    };
  }, [conversations, activeConversation, user?.id, isAuthenticated]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const selectConversation = (conversation: ChatConversation) => {
    console.log("selectConversation called with:", conversation);
    
    // Use double underscore (__) as separator - Format: buyer_id__medicine_id
    const conversationId = `${conversation.buyer_id}__${conversation.medicine_id}`;
    const currentConversationId = params.conversationId as string;

    console.log("Selecting conversation:", {
      conversation,
      supplier_id: conversation.supplier_id,
      buyer_id: conversation.buyer_id,
      medicine_id: conversation.medicine_id,
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
        let buyerId: string | undefined;
        let medicineId: string | undefined;
        
        // Try new separator first (double underscore)
        if (conversationId.includes("__")) {
          [buyerId, medicineId] = conversationId.split("__");
          console.log("Using new __ separator:", { buyerId, medicineId });
        }
        // Fall back to old separator (hyphens) for backward compatibility
        else if (conversationId.includes("-")) {
          const uuidPattern = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
          const match = conversationId.match(uuidPattern);
          if (match) {
            buyerId = match[1];
            medicineId = match[2];
            console.log("Using old - separator (backward compatibility):", { buyerId, medicineId });
          }
        }
        
        if (buyerId && medicineId) {
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
        } else {
          // If we can't parse the URL, select the first one
          console.log("Could not parse URL format, selecting first conversation");
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

  const loadMessages = async (buyerId: string, medicineId: string, reloadConversations = false) => {
    try {
      setLoadingMessages(true);
      const response = await chatService.getMessages(buyerId, medicineId);
      setMessages(response.data.messages.reverse()); // Reverse to show oldest first
      
      // Mark the conversation as read with a separate API call
      try {
        await chatService.markConversationAsRead(buyerId, medicineId);
        console.log("Conversation marked as read via API");
      } catch (markErr) {
        console.error("Error marking conversation as read:", markErr);
      }
      
      // Update conversation unread count to 0 for this conversation locally
      setConversations((prevConversations) => {
        const updated = prevConversations.map((conv) =>
          conv.buyer_id === buyerId && conv.medicine_id === medicineId
            ? { ...conv, unread_count: 0 }
            : conv
        );
        
        // Update title flash with new unread count
        const totalUnread = calculateUnreadCount(updated);
        if (totalUnread > 0) {
          flashBrowserTitle(totalUnread);
        } else {
          clearTitleFlash();
        }
        
        return updated;
      });
      
      // Reload conversations from backend after a short delay to get accurate unread counts
      // This allows the backend to process the mark-as-read before we refresh
      if (reloadConversations) {
        setTimeout(async () => {
          try {
            const conversationsResponse = await chatService.getConversations();
            setConversations(conversationsResponse.data.conversations);
            
            // Ensure active conversation is still set with updated data
            const restoredConv = conversationsResponse.data.conversations.find(
              (conv: ChatConversation) =>
                conv.buyer_id === buyerId && conv.medicine_id === medicineId
            );
            if (restoredConv) {
              setActiveConversation(restoredConv);
            }
          } catch (convErr) {
            // Don't fail if conversations reload fails
            console.error("Error reloading conversations:", convErr);
          }
        }, 500); // Wait 500ms for backend to process mark-as-read
      }
      
      // Scroll to bottom after loading messages
      setTimeout(scrollToBottom, 100);
      setLoadingMessages(false);
    } catch (err) {
      setError("Failed to load messages");
      console.error("Error loading messages:", err);
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if ((message.trim() || selectedFile) && activeConversation && !sendingMessage) {
      try {
        setSendingMessage(true);
        const response = await chatService.sendMessage({
          buyer_id: activeConversation.buyer_id,
          medicine_id: activeConversation.medicine_id,
          message: message.trim() || undefined, // Send text message along with image if provided
          message_type: selectedFile ? "image" : "text",
          image: selectedFile || undefined, // Send image if selected
        });
        
        // Immediately add the new message to the messages list with the correct image_url
        if (response.data?.chat_message) {
          const newMessage = response.data.chat_message;
          // Ensure image_url is properly extracted from metadata if needed
          if (newMessage.message_type === 'image' && !newMessage.image_url && newMessage.metadata?.image_url) {
            newMessage.image_url = newMessage.metadata.image_url;
          }
          
          // Update messages list
          setMessages((prevMessages) => {
            // Check if message already exists to avoid duplicates
            const exists = prevMessages.some((msg) => msg.id === newMessage.id);
            if (!exists) {
              return [...prevMessages, newMessage];
            }
            return prevMessages;
          });
          
          // Update conversations list to reflect new last message and move to top
          setConversations((prevConversations) => {
            const updated = prevConversations.map((conv) => {
              if (
                conv.buyer_id === activeConversation.buyer_id &&
                conv.medicine_id === activeConversation.medicine_id
              ) {
                // Get display message based on message type
                let displayMessage = newMessage.message;
                if (newMessage.message_type === 'image') {
                  displayMessage = '📷 Photo';
                } else if (newMessage.message_type === 'offer' || newMessage.message_type === 'counter_offer') {
                  displayMessage = newMessage.message;
                } else if (newMessage.message_type === 'acceptance') {
                  displayMessage = '✅ Offer accepted';
                } else if (newMessage.message_type === 'rejection') {
                  displayMessage = '❌ Offer rejected';
                }
                
                return {
                  ...conv,
                  last_message: {
                    id: newMessage.id,
                    message: displayMessage,
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
            
            // Sort by updated_at in descending order (most recent first)
            return updated.sort((a, b) => {
              const timeA = new Date(a.updated_at).getTime();
              const timeB = new Date(b.updated_at).getTime();
              return timeB - timeA; // Descending order
            });
          });
          
          // Scroll to bottom immediately after adding message
          setTimeout(scrollToBottom, 100);
        }
        
        setMessage("");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Reload messages to ensure everything is in sync (with a small delay to ensure image is processed)
        setTimeout(async () => {
          await loadMessages(
            activeConversation.buyer_id,
            activeConversation.medicine_id,
            false // Don't reload conversations since we just updated them
          );
          scrollToBottom();
        }, 500);
      } catch (err: any) {
        console.error("Error sending message:", err);
        
        // Handle validation errors with user-friendly messages
        if (err.response?.status === 422) {
          const errors = err.response?.data?.errors || {};
          
          // Check for image size error
          if (errors.image && Array.isArray(errors.image)) {
            const imageError = errors.image[0];
            if (imageError?.includes('2048 kilobytes') || imageError?.includes('2048')) {
              setFileError("Image file is too large. Please select an image smaller than 2MB.");
              setSelectedFile(null);
            } else if (imageError?.includes('image')) {
              setFileError("Please select a valid image file (JPEG, PNG, GIF, or WebP).");
              setSelectedFile(null);
            } else {
              setFileError(imageError || "Invalid image file. Please try again.");
              setSelectedFile(null);
            }
          } else if (errors.message) {
            // Handle other validation errors
            const errorMessages = Object.values(errors).flat() as string[];
            setError(errorMessages[0] || "Validation failed. Please check your input.");
          } else {
            setError(err.response?.data?.message || "Failed to send message. Please try again.");
          }
        } else if (err.response?.status === 413) {
          setFileError("Image file is too large. Please select an image smaller than 2MB.");
          setSelectedFile(null);
        } else {
          setError(err.response?.data?.message || "Failed to send message. Please try again.");
        }
      } finally {
        setSendingMessage(false);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clear any previous errors
      setError(null);
      setFileError(null);
      
      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        setFileError("Please select a valid image file (JPEG, PNG, GIF, or WebP).");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      // Validate file size (2MB = 2048 KB = 2097152 bytes)
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSizeInBytes) {
        setFileError("Image file is too large. Please select an image smaller than 2MB.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      // File is valid
      setSelectedFile(file);
      setFileError(null);
    }
  };

  const handleSendOffer = async () => {
    if (!activeConversation || !offerPrice || offerQuantity < 1) {
      setError("Please enter valid quantity and price");
      return;
    }

    try {
      setSendingOffer(true);
      await chatService.sendMessage({
        buyer_id: activeConversation.buyer_id,
        medicine_id: activeConversation.medicine_id,
        message_type: "offer",
        offer_data: {
          quantity: offerQuantity,
          offered_price: parseFloat(offerPrice),
        },
      });
      setShowOfferForm(false);
      setOfferQuantity(1);
      setOfferPrice("");
      // Reload messages to show the new offer
      await loadMessages(
        activeConversation.buyer_id,
        activeConversation.medicine_id
      );
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send offer");
      console.error("Error sending offer:", err);
    } finally {
      setSendingOffer(false);
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
        return msg.message;
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
          <div className="w-70 bg-white border-r border-gray-200 p-4 pl-2">
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
          <div className="w-70 bg-white border-r border-gray-200 p-4 pl-2">
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
        <div className="w-70 bg-white border-r border-gray-200 p-4 pl-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Chats
          </h3>
          <div className="space-y-3">
            {conversations.map((conversation) => {
              // Use double underscore separator to match URL format
              const conversationId = `${conversation.buyer_id}__${conversation.medicine_id}`;
              const currentConversationId = params.conversationId as string;
              
              // Check if active: compare with new format (__) or old format (-) for backward compatibility
              const isActive = 
                conversationId === currentConversationId ||
                `${conversation.buyer_id}-${conversation.medicine_id}` === currentConversationId;
              
              return (
              <div
                key={`${conversation.buyer_id}__${conversation.medicine_id}`}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
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
                    <p className="font-medium text-gray-900 truncate flex items-center gap-2">
                      {conversation.buyer.name}
                      {conversation.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-[8px] rounded-full h-[15px] w-[15px] flex items-center justify-center">
                          {conversation.unread_count}
                        </span>
                      )}
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
                      {/* <p className="text-xs text-gray-500">Online</p> */}
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
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500">Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id}>
                      {msg.message_type === "offer" || msg.message_type === "counter_offer" ? (
                        <div
                          className={`flex ${
                            msg.sender_id === activeConversation.supplier_id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div className={`rounded-2xl p-6 max-w-md ${
                            msg.metadata?.is_accepted || msg.metadata?.added_to_cart
                              ? "bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200"
                              : msg.metadata?.is_rejected
                              ? "bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200"
                              : "bg-white border-2 border-green-200 shadow-md"
                          }`}>
                            {/* Status Badge */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  msg.metadata?.is_accepted || msg.metadata?.added_to_cart
                                    ? "bg-blue-500"
                                    : msg.metadata?.is_rejected
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                }`}></div>
                                <span className={`text-xs font-semibold uppercase tracking-wide ${
                                  msg.metadata?.is_accepted || msg.metadata?.added_to_cart
                                    ? "text-blue-700"
                                    : msg.metadata?.is_rejected
                                    ? "text-red-700"
                                    : "text-green-700"
                                }`}>
                                  Price Offer
                                </span>
                              </div>
                              {(msg.metadata?.is_accepted || msg.metadata?.added_to_cart) && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Accepted
                                </span>
                              )}
                              {msg.metadata?.is_rejected && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                                  <X className="w-3 h-3" />
                                  Rejected
                                </span>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex gap-4 mb-5">
                              {activeConversation.medicine.image && (
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={activeConversation.medicine.image}
                                    alt={activeConversation.medicine.name}
                                    className="w-20 h-20 object-cover rounded-xl ring-2 ring-white shadow-lg"
                                  />
                                  <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                                    msg.metadata?.is_accepted || msg.metadata?.added_to_cart
                                      ? "bg-blue-500"
                                      : msg.metadata?.is_rejected
                                      ? "bg-red-500"
                                      : "bg-green-500"
                                  }`}></div>
                                </div>
                              )}
                              <div className="flex-1 min-w-0 pt-1">
                                <div className="flex items-baseline gap-2 mb-2">
                                  <span className={`text-2xl font-bold ${
                                    msg.metadata?.is_accepted || msg.metadata?.added_to_cart
                                      ? "text-blue-900"
                                      : msg.metadata?.is_rejected
                                      ? "text-red-900"
                                      : "text-green-900"
                                  }`}>
                                    {msg.metadata?.offered_price 
                                      ? parseFloat(String(msg.metadata.offered_price)).toFixed(2)
                                      : msg.offer_details?.offered_price
                                      ? parseFloat(String(msg.offer_details.offered_price)).toFixed(2)
                                      : "0.00"}
                                  </span>
                                  <span className={`text-sm font-medium ${
                                    msg.metadata?.is_accepted || msg.metadata?.added_to_cart
                                      ? "text-blue-600"
                                      : msg.metadata?.is_rejected
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }`}>
                                    per unit
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                    msg.metadata?.is_accepted || msg.metadata?.added_to_cart
                                      ? "bg-blue-100 text-blue-800"
                                      : msg.metadata?.is_rejected
                                      ? "bg-red-100 text-red-800"
                                      : "bg-green-100 text-green-800"
                                  }`}>
                                    {msg.metadata?.quantity || msg.offer_details?.quantity || 0} units
                                  </div>
                                  <div className={`text-sm font-semibold ${
                                    msg.metadata?.is_accepted || msg.metadata?.added_to_cart
                                      ? "text-blue-700"
                                      : msg.metadata?.is_rejected
                                      ? "text-red-700"
                                      : "text-green-700"
                                  }`}>
                                    Total: {msg.metadata?.total_price || msg.offer_details?.total_price || 0}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Rejection Reason */}
                            {msg.metadata?.is_rejected && msg.metadata?.rejection_reason && (
                              <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                                <p className="text-xs font-semibold text-red-900 mb-1">Rejection Reason:</p>
                                <p className="text-xs text-red-700 leading-relaxed">{msg.metadata.rejection_reason}</p>
                              </div>
                            )}

                            {/* Timestamp */}
                            <div className="mt-4 pt-3 border-t border-gray-200/50">
                              <p className={`text-xs font-medium ${
                                msg.metadata?.is_accepted || msg.metadata?.added_to_cart
                                  ? "text-blue-500"
                                  : msg.metadata?.is_rejected
                                  ? "text-red-500"
                                  : "text-gray-500"
                              }`}>
                                {formatTimestamp(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : msg.message_type === "shipment_dimensions" ? (
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
                      ) : msg.message_type === "acceptance" || msg.message_type === "rejection" ? (
                        <div
                          className={`flex ${
                            msg.sender_id === activeConversation.supplier_id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-md px-4 py-2 rounded-lg ${
                              msg.message_type === "acceptance"
                                ? "bg-green-100 border border-green-300 text-green-800"
                                : "bg-red-100 border border-red-300 text-red-800"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {msg.message_type === "acceptance" ? (
                                <span className="text-lg">✅</span>
                              ) : (
                                <span className="text-lg">❌</span>
                              )}
                              <p className="text-md font-medium">
                                {getDisplayMessage(msg)}
                              </p>
                            </div>
                            <p className="text-xs mt-1 opacity-75">
                              {formatTimestamp(msg.created_at)}
                            </p>
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
                              src={msg.image_url || msg.metadata?.image_url || "/placeholder-image.jpg"}
                              alt="Shared image"
                              className="max-w-full h-auto rounded"
                              onLoad={() => {
                                // Scroll to bottom when image finishes loading
                                setTimeout(scrollToBottom, 100);
                              }}
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                const target = e.target as HTMLImageElement;
                                if (target.src !== "/placeholder-image.jpg") {
                                  target.src = "/placeholder-image.jpg";
                                }
                              }}
                            />
                            <p className="text-sm mt-2">{msg.message}</p>
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

              {/* Offer Form */}
              {showOfferForm && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={offerQuantity}
                      onChange={(e) => setOfferQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Unit
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder="Enter price per unit"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {offerPrice && offerQuantity && (
                    <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        Total: {(parseFloat(offerPrice || "0") * offerQuantity).toFixed(2)}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSendOffer}
                      disabled={sendingOffer || !offerPrice || offerQuantity < 1}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingOffer ? "Sending..." : "Send Offer"}
                    </button>
                    <button
                      onClick={() => {
                        setShowOfferForm(false);
                        setOfferQuantity(1);
                        setOfferPrice("");
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Selected File Preview */}
              {(selectedFile || fileError) && (
                <div className={`px-4 py-2 border-t ${
                  fileError ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  {selectedFile && !fileError ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setFileError(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : fileError ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Paperclip className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-700 font-medium">{fileError}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setFileError(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 pb-2 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowOfferForm(!showOfferForm)}
                    className="p-2 text-primary hover:text-primary hover:bg-gray-100 rounded-lg"
                    title="Send Offer"
                  >
                    <Package className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                    id="file-input"
                    disabled={sendingMessage}
                  />
                  <label
                    htmlFor="file-input"
                    className={`p-2 text-primary hover:text-primary hover:bg-gray-100 rounded-lg cursor-pointer ${
                      sendingMessage ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                    }`}
                    title="Attach Image"
                  >
                    <Paperclip className="w-5 h-5" />
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={selectedFile ? "Add a message (optional)..." : "Type your message..."}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    onKeyPress={(e) => e.key === "Enter" && !sendingMessage && handleSendMessage()}
                    disabled={sendingMessage}
                  />
                  <label
                    htmlFor="file-input"
                    className={`p-2 text-primary hover:text-primary hover:bg-gray-100 rounded-lg cursor-pointer ${
                      sendingMessage ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                    }`}
                    title="Attach Image"
                  >
                    <Paperclip className="w-5 h-5" />
                  </label>
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || (!message.trim() && !selectedFile)}
                    className={`p-2 rounded-lg transition-all duration-300 hover:bg-blue-600 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      (message.trim() || selectedFile) && !sendingMessage
                        ? "bg-blue-600 text-white"
                        : "bg-transparent text-gray-700"
                    }`}
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
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
                {activeConversation.buyer.account_type}
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

