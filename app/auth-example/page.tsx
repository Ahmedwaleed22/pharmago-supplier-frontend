import AuthExample from '@/components/AuthExample';
import { getServerToken, getServerUser } from '@/lib/server-auth';

export default function AuthExamplePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Authentication Example</h1>
      
      <div className="grid gap-6">
        <div className="p-4 border rounded-md">
          <h2 className="text-xl font-semibold mb-2">User Authentication</h2>
          <AuthExample serverAuth={getServerUser} />
        </div>
        
        <div className="p-4 border rounded-md">
          <h2 className="text-xl font-semibold mb-2">Auth Token</h2>
          <AuthExample serverAuth={getServerToken} />
        </div>
      </div>
    </div>
  );
} 