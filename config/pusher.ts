/**
 * Pusher configuration settings
 */
export const PUSHER_CONFIG = {
  APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '',
  CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
  CHANNEL_NAME_PREFIX: 'pharmacy.notifications.',
  getChannelName: (userId: string | number) => `pharmacy.notifications.${userId}`,
};

/**
 * Pusher event names
 */
export enum PUSHER_EVENTS {
  NEW_PRESCRIPTION = 'new-prescription',
  PRESCRIPTION_UPDATED = 'prescription-updated',
  NEW_ORDER = 'new-order',
  ORDER_STATUS_UPDATED = 'order-status-updated',
  NOTIFICATION = 'notification',
} 