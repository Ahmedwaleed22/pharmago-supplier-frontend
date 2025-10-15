# Pusher Integration

This document describes how to use the Pusher integration in the PharmaGo frontend application.

## Setup

1. Add the following environment variables to your `.env.local` file:

```
NEXT_PUBLIC_PUSHER_APP_KEY=your-pusher-app-key
NEXT_PUBLIC_PUSHER_CLUSTER=eu  # or your preferred cluster
```

2. Install the Pusher JS package:

```bash
yarn add pusher-js
```

## Architecture

The Pusher integration consists of several parts:

- A singleton Pusher instance that is initialized once across the application
- User-specific channels in the format `supplier.notifications.{userId}`
- A context provider that initializes the Pusher connection
- Custom hooks for components to listen to Pusher events

## Usage

### Setting the User ID

The Pusher integration uses a user ID to create unique channels for each user. You can set the user ID in two ways:

1. Using the `usePusherContext` hook:

```tsx
import { usePusherContext } from "@/components/providers/PusherProvider";

function MyComponent() {
  const { setUserId } = usePusherContext();
  
  // Set the user ID when the user logs in
  useEffect(() => {
    if (user) {
      setUserId(user.id);
    }
  }, [user]);
  
  // ...
}
```

2. Directly using the `setPusherUserId` function:

```tsx
import { setPusherUserId } from "@/services/pusher";

// Set the user ID when the user logs in
setPusherUserId(userId);
```

The provider will automatically check for a user ID in cookies (`user_id`) when it mounts.

### Listening to Pusher Events in Components

```tsx
import { usePusherEvent } from "@/hooks/usePusherEvent";
import { PUSHER_EVENTS } from "@/config/pusher";

function MyComponent() {
  // Basic usage - event data is available as data in the return object
  const { data, userId } = usePusherEvent(PUSHER_EVENTS.NOTIFICATION);
  
  // With callback function
  usePusherEvent(PUSHER_EVENTS.NEW_ORDER, (data) => {
    console.log("New order received:", data);
    // Handle the event data
  });
  
  // With TypeScript typing
  const { data: prescriptionData } = usePusherEvent<{ id: number; status: string }>(
    PUSHER_EVENTS.PRESCRIPTION_UPDATED
  );
  
  return (
    <div>
      {/* Use the event data in your component */}
      {userId && <p>Connected as user: {userId}</p>}
    </div>
  );
}
```

### Adding New Event Types

To add new event types, update the `PUSHER_EVENTS` enum in `config/pusher.ts`:

```typescript
export enum PUSHER_EVENTS {
  // ... existing events
  NEW_EVENT_TYPE = 'new-event-type',
}
```

### Example Component

Check out `components/examples/PusherExample.tsx` for a working example of how to use Pusher in a component.

## On the Backend

When triggering events from the backend, make sure to use the correct channel name format:

```
supplier.notifications.{userId}
```

Where `{userId}` is the ID of the user who should receive the notification.

## Best Practices

1. Always use the predefined event names from `PUSHER_EVENTS` enum
2. Avoid creating new Pusher instances
3. Set the user ID as early as possible in your application flow
4. Clean up event listeners by using the cleanup function from `useEffect`
5. Be careful with callback dependencies to avoid unnecessary re-bindings 