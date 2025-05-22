'use client';

import { useEffect, useState } from 'react';
import { PUSHER_CONFIG } from '@/config/pusher';
import { usePusherContext } from '@/components/providers/PusherProvider';
import { setPusherUserId, getPusherInstance, disconnectPusher } from '@/services/pusher';

export default function PusherDebug() {
  const [envVars, setEnvVars] = useState({
    appKey: PUSHER_CONFIG.APP_KEY,
    cluster: PUSHER_CONFIG.CLUSTER,
  });
  
  const [manualConfig, setManualConfig] = useState({
    appKey: '',
    cluster: 'eu',
  });
  
  const [testId, setTestId] = useState('test-user-123');
  const { userId, setUserId, channel, isInitialized } = usePusherContext();
  const [connectionStatus, setConnectionStatus] = useState('Not connected');
  const [manualPusherInstance, setManualPusherInstance] = useState<any>(null);
  const [autoPusherInstance, setAutoPusherInstance] = useState<any>(null);
  
  // Test Pusher connection directly
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only run in browser
      import('pusher-js').then(({ default: Pusher }) => {
        try {
          const pusher = new Pusher(PUSHER_CONFIG.APP_KEY || 'invalid-key', {
            cluster: PUSHER_CONFIG.CLUSTER,
            forceTLS: true,
          });
          
          pusher.connection.bind('connected', () => {
            setConnectionStatus('Connected successfully');
          });
          
          pusher.connection.bind('error', (err: any) => {
            setConnectionStatus(`Error: ${JSON.stringify(err)}`);
          });
          
          // Clean up
          return () => {
            pusher.disconnect();
          };
        } catch (err) {
          setConnectionStatus(`Failed to initialize: ${err instanceof Error ? err.message : String(err)}`);
        }
      });
    }
  }, []);
  
  const handleSetTestUser = () => {
    if (testId) {
      setUserId(testId);
    }
  };
  
  const handleManualConnect = () => {
    // Disconnect any existing manual pusher instance
    if (manualPusherInstance) {
      manualPusherInstance.disconnect();
    }
    
    if (!manualConfig.appKey) {
      setConnectionStatus('Error: No Pusher key provided');
      return;
    }
    
    try {
      // Create a new Pusher instance with the manual configuration
      import('pusher-js').then(({ default: Pusher }) => {
        // Enable Pusher logging for debugging
        Pusher.logToConsole = true;
        
        const pusher = new Pusher(manualConfig.appKey, {
          cluster: manualConfig.cluster,
          forceTLS: true,
        });
        
        setManualPusherInstance(pusher);
        
        pusher.connection.bind('connected', () => {
          setConnectionStatus('Manual connection: Connected successfully');
        });
        
        pusher.connection.bind('error', (err: any) => {
          setConnectionStatus(`Manual connection error: ${JSON.stringify(err)}`);
        });
      });
    } catch (err) {
      setConnectionStatus(`Manual connection failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  const handleTestAutoConnect = () => {
    // Disconnect any existing auto pusher instance
    if (autoPusherInstance) {
      autoPusherInstance.disconnect();
      setAutoPusherInstance(null);
    }
    
    setConnectionStatus('Testing automatic connection...');
    
    // Create a connection using the configured environment variables
    if (typeof window !== 'undefined') {
      import('pusher-js').then(({ default: Pusher }) => {
        // Enable Pusher logging for debugging
        Pusher.logToConsole = true;
        
        try {
          console.log('Creating Pusher with:', { 
            key: PUSHER_CONFIG.APP_KEY || '(missing)', 
            cluster: PUSHER_CONFIG.CLUSTER 
          });
          
          if (!PUSHER_CONFIG.APP_KEY) {
            setConnectionStatus('Error: No Pusher key in environment variables');
            return;
          }
          
          const pusher = new Pusher(PUSHER_CONFIG.APP_KEY, {
            cluster: PUSHER_CONFIG.CLUSTER,
            forceTLS: true,
          });
          
          setAutoPusherInstance(pusher);
          
          pusher.connection.bind('connecting', () => {
            setConnectionStatus('Auto connection: Connecting...');
          });
          
          pusher.connection.bind('connected', () => {
            setConnectionStatus('Auto connection: Connected successfully');
          });
          
          pusher.connection.bind('failed', () => {
            setConnectionStatus('Auto connection: Failed to connect');
          });
          
          pusher.connection.bind('disconnected', () => {
            setConnectionStatus('Auto connection: Disconnected');
          });
          
          pusher.connection.bind('error', (err: any) => {
            setConnectionStatus(`Auto connection error: ${JSON.stringify(err)}`);
          });
        } catch (err) {
          setConnectionStatus(`Auto connection failed: ${err instanceof Error ? err.message : String(err)}`);
        }
      });
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Pusher Debug Information</h2>
      
      <div className="mb-6 space-y-4">
        <div>
          <h3 className="text-md font-medium mb-2">Environment Variables</h3>
          <div className="bg-gray-50 p-3 rounded border">
            <div><strong>APP_KEY:</strong> {envVars.appKey || '(not set)'}</div>
            <div><strong>CLUSTER:</strong> {envVars.cluster}</div>
            <div><strong>Pusher Initialized:</strong> {isInitialized ? 'Yes' : 'No'}</div>
            <div className="mt-2">
              <button 
                onClick={handleTestAutoConnect}
                className="bg-green-500 text-white px-3 py-1.5 rounded text-sm"
              >
                Test Auto Connection
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium mb-2">Manual Connection Test</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={manualConfig.appKey} 
                onChange={(e) => setManualConfig({ ...manualConfig, appKey: e.target.value })}
                placeholder="Enter Pusher App Key" 
                className="border rounded px-3 py-1.5 flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={manualConfig.cluster} 
                onChange={(e) => setManualConfig({ ...manualConfig, cluster: e.target.value })}
                placeholder="Enter Pusher Cluster" 
                className="border rounded px-3 py-1.5 flex-1"
              />
            </div>
            <button 
              onClick={handleManualConnect}
              className="bg-blue-500 text-white px-3 py-1.5 rounded"
            >
              Test Manual Connection
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium mb-2">Connection Status</h3>
          <div className={`bg-gray-50 p-3 rounded border ${
            connectionStatus.includes('Error') || connectionStatus.includes('Failed') 
              ? 'text-red-600' 
              : connectionStatus.includes('Connected') 
                ? 'text-green-600' 
                : 'text-yellow-600'
          }`}>
            {connectionStatus}
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium mb-2">Test User Connection</h3>
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="text" 
              value={testId} 
              onChange={(e) => setTestId(e.target.value)}
              placeholder="Enter test user ID" 
              className="border rounded px-3 py-1.5 flex-1"
            />
            <button 
              onClick={handleSetTestUser}
              className="bg-blue-500 text-white px-3 py-1.5 rounded"
            >
              Set Test User
            </button>
          </div>
          <div className="text-sm mt-2">
            <div><strong>Current User ID:</strong> {userId || '(not set)'}</div>
            <div><strong>Channel Connected:</strong> {channel ? 'Yes' : 'No'}</div>
            {userId && (
              <div><strong>Channel Name:</strong> {PUSHER_CONFIG.getChannelName(userId)}</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">Troubleshooting steps:</p>
        <ol className="list-decimal ml-5 mt-2 space-y-1">
          <li>
            <strong>Environment variables:</strong> Make sure <code>NEXT_PUBLIC_PUSHER_APP_KEY</code> and <code>NEXT_PUBLIC_PUSHER_CLUSTER</code> are set in <code>.env.local</code>
          </li>
          <li>Click "Test Auto Connection" to test with current environment variables</li>
          <li>Try manual connection with your Pusher keys if auto connection fails</li>
          <li>Set a user ID to test channel subscription</li>
          <li>Check browser console (F12) for detailed Pusher logs</li>
        </ol>
      </div>
    </div>
  );
} 