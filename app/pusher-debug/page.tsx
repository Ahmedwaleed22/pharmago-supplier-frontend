import PusherDebug from "@/components/examples/PusherDebug";
import PusherExample from "@/components/examples/PusherExample";

export default function PusherDebugPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-6">Pusher Connection Debug</h1>
      
      <div className="bg-blue-50 p-4 border border-blue-200 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Pusher Troubleshooting Guide</h2>
        <p className="mb-2">Follow these steps to ensure your Pusher connection works correctly:</p>
        <ol className="list-decimal ml-6 space-y-1">
          <li>Make sure you have set up your <code className="bg-gray-100 px-1 rounded">.env.local</code> file with:</li>
          <ul className="list-disc ml-8 mb-2">
            <li><code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_PUSHER_APP_KEY=your-pusher-key</code></li>
            <li><code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_PUSHER_CLUSTER=eu</code> (or your cluster)</li>
          </ul>
          <li>Set a user ID using the form below (this is required for channel subscription)</li>
          <li>Verify in the browser console (F12) that you see successful connection logs</li>
          <li>Check the Pusher dashboard to see if your connection and channel appear</li>
        </ol>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Connection Diagnostics</h2>
        <PusherDebug />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Pusher Example</h2>
        <PusherExample />
      </div>
      
      <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg mt-6">
        <h2 className="text-lg font-semibold mb-2">Common Issues & Solutions</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <strong>No connection in network tab:</strong> Verify your Pusher API key is correct and 
            the network is not blocking WebSocket connections.
          </li>
          <li>
            <strong>Connected but not subscribed to channel:</strong> Make sure a user ID is set. The channel 
            format is <code className="bg-gray-100 px-1 rounded">pharmacy.notifications.YOUR_USER_ID</code>.
          </li>
          <li>
            <strong>Not receiving events:</strong> Check the channel name is exactly what you expect and 
            that events are being triggered with the correct event names.
          </li>
          <li>
            <strong>Connection drops frequently:</strong> Could be due to network issues or firewall settings.
          </li>
        </ul>
      </div>
    </div>
  );
} 