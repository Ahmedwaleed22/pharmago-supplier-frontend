import { useEffect, useRef } from 'react';
import { 
  subscribeToChatChannel, 
  unsubscribeFromChatChannel,
  getPusherInstance 
} from '@/services/pusher';
import { ChatMessage } from '@/services/chatService';

interface UseChatPusherOptions {
  supplierId: string;
  buyerId: string;
  medicineId: string;
  onNewMessage?: (message: ChatMessage) => void;
  enabled?: boolean;
}

/**
 * Hook to listen to Pusher events for a specific chat conversation
 * @param options - Configuration options for the hook
 * @returns void
 */
export function useChatPusher({
  supplierId,
  buyerId,
  medicineId,
  onNewMessage,
  enabled = true,
}: UseChatPusherOptions) {
  const channelRef = useRef<any | null>(null);
  const onNewMessageRef = useRef(onNewMessage);

  // Keep the callback ref updated
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    console.log('Setting up chat Pusher listener', {
      supplierId,
      buyerId,
      medicineId,
    });

    // Subscribe to the chat channel
    const channel = subscribeToChatChannel(supplierId, buyerId, medicineId);
    channelRef.current = channel;

    if (channel) {
      // Listen for new messages
      channel.bind('new_message', (data: ChatMessage) => {
        console.log('Received new message via Pusher:', data);
        
        if (onNewMessageRef.current) {
          onNewMessageRef.current(data);
        }
      });

      // Listen for message read status
      channel.bind('message_read', (data: any) => {
        console.log('Message read status updated via Pusher:', data);
      });
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up chat Pusher listener');
      if (channel) {
        channel.unbind_all();
        unsubscribeFromChatChannel(supplierId, buyerId, medicineId);
      }
    };
  }, [supplierId, buyerId, medicineId, enabled]);

  return channelRef.current;
}

