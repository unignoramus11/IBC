import Terminal from '../components/Terminal';
import { generateDeviceId, allocateWorld } from '../lib/deviceId';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-green-400">
      {/* 
        This is a server component, so we need to load these client components 
        dynamically in the client component itself 
      */}
      <ClientTerminal />
    </div>
  );
}

// Client component to handle device ID generation
'use client';

import { useEffect, useState } from 'react';

function ClientTerminal() {
  const [deviceId, setDeviceId] = useState<string>('');
  const [worldId, setWorldId] = useState<number>(0);
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Generate device ID and determine world allocation
    const id = generateDeviceId();
    const { worldId, variant } = allocateWorld(id);
    
    setDeviceId(id);
    setWorldId(worldId);
    setVariant(variant);
    setIsLoading(false);
    
    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Device ID: ${id}`);
      console.log(`World ID: ${worldId}`);
      console.log(`Variant: ${variant}`);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-terminal-green text-xl">
          Initializing terminal...
        </div>
      </div>
    );
  }

  return <Terminal deviceId={deviceId} worldId={worldId} variant={variant} />;
}
