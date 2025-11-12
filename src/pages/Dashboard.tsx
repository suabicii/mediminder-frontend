import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Clock, Check, Pill } from 'lucide-react';
import api from '../lib/api';
import { DashboardData } from '../types';
import NotificationSetup from '../components/NotificationSetup';
import { triggerTestPush, unsubscribeAndPurge } from '../utils/notifications';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    loadMedications();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/dashboard/');
      setDashboardData(response.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMedications = async () => {
    try {
      const response = await api.get('/api/medications/');
      const data = response.data;
      setMedications(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to load medications:', err);
      setMedications([]);
    }
  };

  const markDosageAsTaken = async (medicationId: number, dosageId: number) => {
    try {
      await api.post(`/api/medications/${medicationId}/mark_as_taken/`, {
        dosage_id: dosageId
      });
      loadDashboardData();
      loadMedications();
    } catch (err) {
      console.error('Failed to mark dosage as taken:', err);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p>Błąd: {error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Twoje dzisiejsze dawki leków</p>
        </div>

        <NotificationSetup />

        <div className="flex gap-3 mb-6">
          <button
            onClick={async () => {
              const ok = await triggerTestPush();
              if (!ok) alert('Nie udało się wysłać testowego powiadomienia');
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Wyślij testowe powiadomienie
          </button>
          <button
            onClick={async () => {
              const ok = await unsubscribeAndPurge();
              if (!ok) alert('Nie udało się usunąć subskrypcji');
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Usuń subskrypcję push
          </button>
        </div>

        {/* Alerty */}
        {dashboardData.active_alerts.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="font-semibold text-red-800">Alerty magazynowe</h3>
            </div>
            <ul className="mt-2 ml-7">
              {dashboardData.active_alerts.map((alert) => (
                <li key={alert.id} className="text-red-700">
                  {alert.medication_name}: {alert.alert_type === 'low_stock' ? 'Niski stan' : 'Brak leku'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Przeterminowane dawki */}
        {dashboardData.overdue_dosages.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-500 mr-2" />
              <h3 className="font-semibold text-orange-800">
                Przeterminowane dawki ({dashboardData.overdue_dosages.length})
              </h3>
            </div>
            <div className="mt-3 space-y-2">
              {dashboardData.overdue_dosages.map((dosage) => (
                <div key={dosage.id} className="flex items-center justify-between bg-white p-3 rounded shadow-sm">
                  <div className="flex items-center">
                    <Pill className="h-4 w-4 text-orange-500 mr-2" />
                    <span className="font-medium">{dosage.medication_name}</span>
                    <span className="text-sm text-gray-500 ml-3">{formatTime(dosage.scheduled_time)}</span>
                  </div>
                  <button
                    onClick={() => markDosageAsTaken(dosage.medication, dosage.id)}
                    className="px-4 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                  >
                    Odhacz
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dzisiejsze dawki */}
        <div>
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Dzisiejsze dawki</h2>
          </div>

          {medications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Pill className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nie masz jeszcze dodanych leków</p>
              <a
                href="/medications"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mt-2"
              >
                Dodaj pierwszy lek
              </a>
            </div>
          ) : dashboardData.today_dosages.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Wszystkie dawki zażyte! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.today_dosages.map((dosage) => (
                <div
                  key={dosage.id}
                  className={`bg-white rounded-lg shadow p-4 ${
                    dosage.is_overdue ? 'border-l-4 border-red-500' : ''
                  } ${dosage.taken ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {dosage.taken ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Pill className="h-5 w-5 text-blue-500" />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{dosage.medication_name}</h3>
                        <p className="text-sm text-gray-500">{formatTime(dosage.scheduled_time)}</p>
                      </div>
                    </div>
                    {!dosage.taken && (
                      <button
                        onClick={() => markDosageAsTaken(dosage.medication, dosage.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        Odhacz
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

