import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Pill, AlertTriangle, Loader, X, Clock } from 'lucide-react';
import api from '../lib/api';
import { Medication } from '../types';

const Medications: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    quantity: 0,
    quantity_alert_threshold: 10,
    dosage_schedule: 'once' as 'once' | 'twice' | 'thrice' | 'custom',
    dosage_times: [] as string[]
  });

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/medications/');
      const data = response.data;
      setMedications(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to load medications:', err);
      setMedications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.dosage_schedule === 'custom' && formData.dosage_times.length === 0) {
      alert('Proszę dodać przynajmniej jedną godzinę dla własnego harmonogramu');
      return;
    }
    
    try {
      if (editingMedication) {
        await api.put(`/api/medications/${editingMedication.id}/`, formData);
      } else {
        await api.post('/api/medications/', formData);
      }
      setIsModalOpen(false);
      setEditingMedication(null);
      resetForm();
      loadMedications();
    } catch (err) {
      console.error('Failed to save medication:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten lek?')) return;
    try {
      await api.delete(`/api/medications/${id}/`);
      loadMedications();
    } catch (err) {
      console.error('Failed to delete medication:', err);
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      quantity: medication.quantity,
      quantity_alert_threshold: medication.quantity_alert_threshold,
      dosage_schedule: medication.dosage_schedule,
      dosage_times: medication.dosage_times
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      quantity: 0,
      quantity_alert_threshold: 10,
      dosage_schedule: 'once',
      dosage_times: []
    });
    setEditingMedication(null);
  };

  const scheduleOptions = [
    { value: 'once', label: '1x dziennie' },
    { value: 'twice', label: '2x dziennie' },
    { value: 'thrice', label: '3x dziennie' },
    { value: 'custom', label: 'Własny harmonogram' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Moje leki</h1>
            <p className="text-gray-600">Zarządzaj lekami i suplementami</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-5 w-5 mr-2" />
            Dodaj lek
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : medications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Nie masz jeszcze dodanych leków</p>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Dodaj pierwszy lek
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medications.map((medication) => (
              <div
                key={medication.id}
                className={`bg-white rounded-lg shadow p-6 ${
                  medication.is_low_stock ? 'border-l-4 border-orange-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <Pill className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">{medication.name}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(medication)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(medication.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Dawkowanie:</strong> {medication.dosage}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Ilość:</strong> {medication.quantity} szt.
                  </p>
                  {medication.stock_days > 0 && (
                    <p className="text-sm text-gray-600">
                      <strong>Zapas:</strong> ~{medication.stock_days} dni
                    </p>
                  )}
                  {medication.is_low_stock && (
                    <div className="flex items-center text-orange-600 mt-2">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Niski stan</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingMedication ? 'Edytuj lek' : 'Dodaj nowy lek'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwa leku/suplementu *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dawkowanie (np. "2 tabletki", "500mg") *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ilość w magazynie *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Próg alertu
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity_alert_threshold}
                      onChange={(e) => setFormData({ ...formData, quantity_alert_threshold: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harmonogram dawkowania
                  </label>
                  <select
                    value={formData.dosage_schedule}
                    onChange={(e) => {
                      const schedule = e.target.value as 'once' | 'twice' | 'thrice' | 'custom';
                      setFormData({ 
                        ...formData, 
                        dosage_schedule: schedule,
                        dosage_times: schedule === 'custom' ? formData.dosage_times : []
                      });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    {scheduleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.dosage_schedule === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Godziny przyjmowania
                    </label>
                    <div className="space-y-2">
                      {formData.dosage_times.map((time, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2 flex-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <input
                              type="time"
                              value={time}
                              onChange={(e) => {
                                const newTimes = [...formData.dosage_times];
                                newTimes[index] = e.target.value;
                                setFormData({ ...formData, dosage_times: newTimes });
                              }}
                              className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newTimes = formData.dosage_times.filter((_, i) => i !== index);
                                setFormData({ ...formData, dosage_times: newTimes });
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ 
                            ...formData, 
                            dosage_times: [...formData.dosage_times, '08:00'] 
                          });
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-gray-600 hover:text-blue-600"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Dodaj godzinę</span>
                      </button>
                      {formData.dosage_times.length === 0 && (
                        <p className="text-sm text-gray-500 italic">
                          Dodaj przynajmniej jedną godzinę
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={formData.dosage_schedule === 'custom' && formData.dosage_times.length === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {editingMedication ? 'Zapisz zmiany' : 'Dodaj lek'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medications;

