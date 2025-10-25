import React from 'react';
import { Heart, Activity, Clock, CheckCircle } from 'lucide-react';

interface HealthStatus {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  message: string;
}

interface HealthCheckProps {
  healthData: HealthStatus | null;
  isLoading: boolean;
  error: string | null;
  onCheckHealth: () => void;
}

const HealthCheck: React.FC<HealthCheckProps> = ({
  healthData,
  isLoading,
  error,
  onCheckHealth,
}) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            Health Check
          </h2>
          <button
            onClick={onCheckHealth}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {isLoading ? (
              <Clock className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isLoading ? 'Checking...' : 'Check Health'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {healthData && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Heart className={`h-5 w-5 ${healthData.status === 'healthy' ? 'text-green-500' : 'text-red-500'}`} />
              <span className="font-semibold text-gray-700">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                healthData.status === 'healthy' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {healthData.status}
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Service:</strong> {healthData.service}</p>
              <p><strong>Version:</strong> {healthData.version}</p>
              <p><strong>Message:</strong> {healthData.message}</p>
              <p><strong>Timestamp:</strong> {new Date(healthData.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )}

        {!healthData && !error && !isLoading && (
          <div className="text-center text-gray-500 py-8">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Click "Check Health" to verify backend connection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthCheck;
