import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import HealthCheck from './components/HealthCheck';
import api from './lib/api';

interface HealthStatus {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  message: string;
}

const App: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/api/health/');
      setHealthData(response.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to backend';
      setError(errorMessage);
      setHealthData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">MediMinder</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Aplikacja do monitorowania leczenia i suplementacji z funkcją przypominania o dawkach
          </p>
        </div>

        {/* Health Check Component */}
        <div className="flex justify-center">
          <HealthCheck
            healthData={healthData}
            isLoading={isLoading}
            error={error}
            onCheckHealth={checkHealth}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>MediMinder Frontend - Połączony z backendem Django</p>
          <p className="mt-1">API URL: {import.meta.env.VITE_API_URL || 'http://localhost:8000'}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
